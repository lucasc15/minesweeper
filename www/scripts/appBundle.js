// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var MinesweeperGame;
(function (MinesweeperGame) {
    "use strict";
    var Application;
    (function (Application) {
        function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }
        Application.initialize = initialize;
        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
            // var parentElement = document.getElementById('deviceready');
            // var listeningElement = parentElement.querySelector('.listening');
            // var receivedElement = parentElement.querySelector('.received');
            // listeningElement.setAttribute('style', 'display:none;');
            // receivedElement.setAttribute('style', 'display:block;');
            var domElement = document.getElementById('app');
            angular.bootstrap(domElement, ["minesweeperApp"]);
        }
        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        }
        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }
    })(Application = MinesweeperGame.Application || (MinesweeperGame.Application = {}));
    window.onload = function () {
        Application.initialize();
    };
})(MinesweeperGame || (MinesweeperGame = {}));
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
'use strict';
var MinesweeperApp;
(function (MinesweeperApp) {
    var routeConfig = function ($stateProvider) {
        $stateProvider
            .state('default', {
            url: '/',
            templateUrl: "templates/home.html",
            controller: MinesweeperApp.HomeController
        })
            .state('home', {
            url: '/home',
            templateUrl: "templates/home.html",
            controller: MinesweeperApp.HomeController
        })
            .state('game-config-size', {
            url: '/game-config',
            templateUrl: "templates/game-config.html",
            controller: MinesweeperApp.GameConfigController
        })
            .state('game-config-difficulty', {
            url: '/game-config/:x/:y',
            templateUrl: "templates/game-config.html",
            controller: MinesweeperApp.GameConfigController,
        })
            .state('game', {
            url: '/game/:x/:y/:difficulty',
            templateUrl: "templates/game.html",
            controller: MinesweeperApp.GameController,
        })
            .state('score', {
            url: '/scores',
            templateUrl: "templates/score.html",
            controller: MinesweeperApp.ScoreController
        })
            .state("otherwise", {
            url: "*path",
            templateUrl: "templates/home.html",
            controller: MinesweeperApp.HomeController
        });
    };
    routeConfig.$inject = ['$stateProvider'];
    angular.module('minesweeperApp', ['ui.router', 'ngRoute'])
        .service('gameService', MinesweeperApp.GameService)
        .service('mineDisplayService', MinesweeperApp.MineDisplayService)
        .controller('homeController', MinesweeperApp.HomeController)
        .controller('gameConfigController', MinesweeperApp.GameConfigController)
        .controller('gameController', MinesweeperApp.GameController)
        .controller('scoreController', MinesweeperApp.ScoreController)
        .config(routeConfig);
})(MinesweeperApp || (MinesweeperApp = {}));
var MinesweeperApp;
(function (MinesweeperApp) {
    class GameController {
        constructor($scope, $stateParams, $interval, gameService, mineDisplayService) {
            // Bind scope to controller fields
            $scope.vm = this;
            this.markingCursor = false;
            this.mineMarkerText = "Activate Marker";
            // Setup services
            this.gameService = gameService;
            this.mineDisplayService = mineDisplayService;
            // Setup Game
            this.gameData = new GameData($stateParams.x, $stateParams.y, $stateParams.difficulty);
            this.gameService.setGameSize(this.gameData.x, this.gameData.y);
            this.loadGame(this.gameData.mineCount);
            // Start game timer
            this.$interval = $interval;
            this.startTime();
            console.log(this.game);
        }
        loadGame(mineCount) {
            // Initalizes a game based on the size (x, y) and a difficulty (mine count)
            this.game = this.gameService.loadGame(mineCount);
        }
        makeMove(x, y) {
            // Makes a move and changes game state through game service, then checks if it is solved
            // If is marking cursor mode
            if (this.markingCursor) {
                this.markMine(x, y);
                return;
            }
            // If in not mine marking mode;
            if (!this.gameService.makeMove(x, y, this.game)) {
                this.failedGame();
            }
            if (this.gameService.isSolved(this.game)) {
                this.gameData.isSolved = true;
                this.$interval.cancel(this.timeCounter);
            }
            if (this.gameData.mineDisplayCount != this.gameData.mineCount) {
                this.gameData.mineDisplayCount =
                    this.gameData.mineCount - this.gameService.updateMineCount(this.game);
            }
        }
        // use like <tag ng-class="getClass(x, y)"/> where x/y is column/row
        getClass(x, y) {
            // Wrapper to determine the style (class) of a square based on its state/mine value
            return this.mineDisplayService.getClass(this.game[y][x], this.gameData.gameFailed);
        }
        toggleMineMarker() {
            this.markingCursor = !this.markingCursor;
            this.mineMarkerText = (this.markingCursor) ?
                "Deactivate Marker" : "Activate Marker";
        }
        getMineMarkerClass() {
            if (this.markingCursor) {
                return 'marker-activated button button-block button-positive';
            }
            return 'marker-deactivated button button-block button-calm';
        }
        markMine(x, y) {
            // Player marks a square as a mine. Not activated as how does right clicking work on the app?
            this.gameData.mineDisplayCount += this.gameService.markMine(x, y, this.game);
        }
        failedGame() {
            // Changed game state to failed, notifies view
            this.$interval.cancel(this.timeCounter);
            this.gameData.gameFailed = true;
        }
        // private gameTimer($scope: ng.IScope): void {
        gameTimer() {
            // Function to be run in a setInterval to track time passed since game start
            this.gameData.timeCount++;
        }
        startTime() {
            this.timeCounter = this.$interval(() => this.gameTimer(), 1000);
        }
        resetGame() {
            this.gameService.resetGame(this.game);
            this.gameData.timeCount = 0;
            this.startTime();
            this.gameData.gameFailed = false;
            this.gameData.isSolved = false;
        }
    }
    // Controller to store game state and create wrapper functions for the GameService interface
    GameController.$inject = ['$scope', '$stateParams', '$interval', 'gameService', 'mineDisplayService'];
    MinesweeperApp.GameController = GameController;
    class GameConfigController {
        constructor($stateParams, $scope) {
            this.$scope = $scope;
            this.$scope.x = ($stateParams.x != undefined) ? $stateParams.x : 0;
            this.$scope.y = ($stateParams.y != undefined) ? $stateParams.y : 0;
            this.$scope.showDifficulty = (this.$scope.x != 0 && this.$scope.y != 0);
            this.$scope.title = (this.$scope.showDifficulty) ?
                'Game Setup - Difficulty' : 'Game Setup - Size';
            this.$scope.gameSizes = [
                new GameSize(10, 10, 'Small (10 x 10)'),
                new GameSize(10, 20, 'Medium (10 X 20)'),
                new GameSize(10, 30, 'Large (10 x 30)')
            ];
            this.$scope.gameDifficulties = [
                new GameDifficulty(10, 'Easy'),
                new GameDifficulty(20, 'Medium'),
                new GameDifficulty(30, 'Hard')
            ];
        }
    }
    // Controller to handle views related to config of minesweeper game. Relies on stateParams to pass user values
    // between GameConfig instances as well as to initialize the game
    GameConfigController.$inject = ['$stateParams', '$scope'];
    MinesweeperApp.GameConfigController = GameConfigController;
    class GameSize {
        constructor(x, y, name) {
            this.x = x;
            this.y = y;
            this.name = name;
        }
    }
    class GameDifficulty {
        constructor(difficulty, name) {
            this.difficulty = difficulty;
            this.name = name;
        }
    }
    class HomeController {
        constructor($scope) {
            this.$scope = $scope;
            this.$scope.title = 'Home';
            this.$scope.startGameMessage = "New Game";
            this.$scope.scoresMessage = "My High Scores";
        }
    }
    // Simple controller to store messages for the Home view to either start game or view scores. 
    HomeController.$inject = ['$scope'];
    MinesweeperApp.HomeController = HomeController;
    class GameData {
        constructor(x, y, difficulty) {
            this.x = x;
            this.y = y;
            this.difficulty = difficulty;
            this.mineCount = this.mineDisplayCount =
                Math.floor(this.x * this.y * this.difficulty / 100);
            this.isSolved = false;
            this.gameFailed = false;
            this.timeCount = 0;
        }
    }
    class ScoreController {
    }
    MinesweeperApp.ScoreController = ScoreController;
})(MinesweeperApp || (MinesweeperApp = {}));
// App modelled after: https://github.com/ricardocanelas/angularjs-typescript-sample-app/blob/master/app/src/services/companyService.ts
var MinesweeperApp;
(function (MinesweeperApp) {
    class GameService {
        constructor($q) {
            this.$q = $q;
            this.mineValue = -1;
            this.markedValue = -2;
            this.markedMineValue = -3;
        }
        loadGame(mineCount) {
            var game = this.createEmptyArray(this.sizeX, this.sizeY);
            var randX, randY;
            // Randomly pick indices
            while (mineCount > 0) {
                randX = this.randomIntFromInterval(0, this.sizeX - 1);
                randY = this.randomIntFromInterval(0, this.sizeY - 1);
                if (game[randY][randX] === undefined) {
                    game[randY][randX] = -1;
                    mineCount--;
                }
            }
            return game;
        }
        markMine(x, y, game) {
            // Return number used to update the number of mines marked versus total mines
            // return: amount to increment mineDisplayAmount
            if (game[y][x] != -2 && game[y][x] === undefined) {
                // Allow unselected squares to be marked only
                game[y][x] = this.markedValue;
                return -1;
            }
            else if (game[y][x] == this.markedValue) {
                // case to unmark squares
                game[y][x] = undefined;
                return 1;
            }
            else if (game[y][x] == this.mineValue) {
                game[y][x] = this.markedMineValue;
                return -1;
            }
            else {
                return 0;
            }
        }
        makeMove(x, y, game) {
            // Move calculates if move is a mine (false == fail), else propagates choice until it hits non 0 value (0 mine around) places
            if (game[y][x] < 0 || game[y][x] === undefined) {
                if (game[y][x] == this.mineValue) {
                    return false;
                }
                if (game[y][x] == this.markedMineValue || game[y][x] == this.markedValue) {
                    return true;
                }
                game[y][x] = this.countMines(x, y, game);
                if (game[y][x] == 0) {
                    var searched = this.createEmptyBooleanArray(this.sizeX, this.sizeY);
                    this.searchMove(x, y, game, searched);
                }
                return true;
            }
            return true;
        }
        searchMove(x, y, game, searched) {
            // Recursive helper to continue searching adjacent squares until it reaches one that is bordering a mine, at which point recursive calls stop
            var mines;
            for (var i = y - 1; i <= y + 1; i++) {
                for (var j = x - 1; j <= x + 1; j++) {
                    if ((i >= 0 && i < this.sizeY) && (j >= 0 && j < this.sizeX) && !searched[i][j] && game[i][j] != this.mineValue) {
                        mines = this.countMines(j, i, game);
                        searched[i][j] = true;
                        game[i][j] = mines;
                        if (mines == 0) {
                            this.searchMove(j, i, game, searched);
                        }
                    }
                }
            }
        }
        countMines(x, y, game) {
            // Helper function to count the number of mines around a point (a total of 8 bordering squares)
            var bombCount = 0;
            for (var i = y - 1; i <= y + 1; i++) {
                for (var j = x - 1; j <= x + 1; j++) {
                    if ((j >= 0 && j < this.sizeX) && (i >= 0 && i < this.sizeY)) {
                        if (game[i][j] == this.mineValue || game[i][j] == this.markedMineValue) {
                            bombCount++;
                        }
                    }
                }
            }
            return bombCount;
        }
        isSolved(game) {
            // Checks to see if the current game is solved
            for (var i = 0; i < this.sizeY; i++) {
                for (var j = 0; j < this.sizeX; j++) {
                    if (game[i][j] === undefined) {
                        return false;
                    }
                }
            }
            return true;
        }
        solveGame(game) {
            for (var i = 0; i < this.sizeY; i++) {
                for (var j = 0; j < this.sizeX; j++) {
                    if (game[i][j] === undefined) {
                        game[i][j] = this.countMines(j, i, game);
                    }
                }
            }
        }
        updateMineCount(game) {
            var markedMineCount = 0;
            for (var i = 0; i < this.sizeY; i++) {
                for (var j = 0; j < this.sizeX; j++) {
                    if (game[i][j] == this.markedMineValue) {
                        markedMineCount++;
                    }
                }
            }
            return markedMineCount;
        }
        randomIntFromInterval(min, max) {
            // Helper function to choose a random number between min and max
            // Used to choose a game[rand][rand] place for a bomb placement
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        createEmptyArray(x, y) {
            // Helper function to create an empty array of all undefined values as preliminary game structure
            var game = new Array();
            for (var i = 0; i < y; i++) {
                var tmp = new Array();
                for (var j = 0; j < x; j++) {
                    tmp.push(undefined);
                }
                game.push(tmp);
            }
            return game;
        }
        createEmptyBooleanArray(x, y) {
            // Helper function to create array the same size of the game to keep track of searched squares; initalizes as all false values
            var arr = new Array();
            for (var i = 0; i < y; i++) {
                var tmp = new Array();
                for (var j = 0; j < x; j++) {
                    tmp.push(false);
                }
                arr.push(tmp);
            }
            return arr;
        }
        setGameSize(x, y) {
            // Helper function to set a reference to a game size;
            this.sizeX = x;
            this.sizeY = y;
        }
        resetGame(game) {
            for (var i = 0; i < this.sizeY; i++) {
                for (var j = 0; j < this.sizeX; j++) {
                    if (game[i][j] != this.mineValue) {
                        game[i][j] = undefined;
                    }
                }
            }
        }
    }
    GameService.$inject = ['$q'];
    MinesweeperApp.GameService = GameService;
    // Need to register service to app in this file, otherwise it is undefined in angularJS for some reason
    angular.module('minesweeperApp').service('gameService', GameService);
    class MineDisplayService {
        constructor($q) {
            this.$q = $q;
        }
        getClass(value, failedGame) {
            // Helper function to determine current state of a tile and return the class value for the square
            var displayClass;
            switch (value) {
                case -3:
                    displayClass = "marked-mine";
                case -2:
                    displayClass = "marked-mine";
                    break;
                case -1:
                    // TODO remove redebugging lines here when finished!
                    if (failedGame) {
                        displayClass = "mine";
                    }
                    else {
                        displayClass = "blank";
                    }
                    // TODO commend above and uncomment below for debugging/ to see mines
                    // displayClass = "mine";
                    break;
                case 0:
                    displayClass = "no-mine";
                    break;
                case 1:
                    displayClass = "one-mine";
                    break;
                case 2:
                    displayClass = "two-mine";
                    break;
                case 3:
                    displayClass = "three-mine";
                    break;
                case 4:
                    displayClass = "four-mine";
                    break;
                case 5:
                    displayClass = "five-mine";
                    break;
                case 6:
                    displayClass = "six-mine";
                    break;
                case 7:
                    displayClass = "seven-mine";
                    break;
                case 8:
                    displayClass = "eight-mine";
                    break;
                default:
                    displayClass = "blank";
            }
            return displayClass;
        }
    }
    MineDisplayService.$inject = ['$q'];
    MinesweeperApp.MineDisplayService = MineDisplayService;
    angular.module('minesweeperApp').service('mineDisplayService', MineDisplayService);
})(MinesweeperApp || (MinesweeperApp = {}));
//# sourceMappingURL=appBundle.js.map