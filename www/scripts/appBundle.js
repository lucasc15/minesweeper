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
    var GameController = (function () {
        function GameController($scope, $stateParams, $interval, gameService, mineDisplayService) {
            console.log("Game constructor");
            // Use URL angular route to accept these values to start a new game
            // services/dependencies to register with the controller
            this.gameService = gameService;
            this.mineDisplayService = mineDisplayService;
            console.log("Registered services");
            // Initialize $scope binding
            this.$scope = $scope;
            this.$scope.gameData = new GameData($stateParams.x, $stateParams.y, $stateParams.difficulty / 100);
            console.log('initialized scope data');
            // Game state settings/loading
            this.loadGame(this.$scope.gameData.x, this.$scope.gameData.y, this.$scope.gameData.mineCount);
            // Start game timer
            console.log('loaded game');
            this.$interval = $interval;
            console.log("got here!");
            this.timeCounter = $interval(this.gameTimer, 1000);
            console.log("end of constructor");
        }
        GameController.prototype.loadGame = function (x, y, mineCount) {
            // Initalizes a game based on the size (x, y) and a difficulty (mine count)
            this.game = this.gameService.loadGame(x, y, mineCount);
        };
        GameController.prototype.makeMove = function (x, y) {
            // Makes a move and changes game state through game service, then checks if it is solved
            if (!this.gameService.makeMove(x, y, this.game)) {
                this.failedGame();
            }
            this.$scope.gameData.isSolved = this.gameService.isSolved(this.$scope.gameData.x, this.$scope.gameData.y, this.game);
        };
        GameController.prototype.getClass = function (x, y) {
            // Wrapper to determine the style (class) of a square based on its state/mine value
            return this.mineDisplayService.getClass(this.game[x][y], this.$scope.gameData.gameFailed);
        };
        GameController.prototype.markMine = function (x, y) {
            // Player marks a square as a mine. Not activated as how does right clicking work on the app?
            this.$scope.gameData.mineDisplayCount += this.gameService.markMine(x, y, this.game);
        };
        // use like <tag ng-class="getMineDisplay(x, y)"/>
        GameController.prototype.getMineDisplay = function (x, y) {
            // Uses a service related to the game service that applies the class to display every game square
            return this.mineDisplayService.getClass(this.game[x][y], this.$scope.gameData.gameFailed);
        };
        GameController.prototype.failedGame = function () {
            // Changed game state to failed, notifies view
            this.$interval.cancel(this.timeCounter);
            this.$scope.gameData.gameFailed = true;
        };
        GameController.prototype.gameTimer = function () {
            // Function to be run in a setInterval to track time passed since game start
            this.$scope.gameData.timeCount++;
        };
        return GameController;
    }());
    // Controller to store game state and create wrapper functions for the GameService interface
    GameController.$inject = ['$scope', '$stateParams', '$interval', 'gameService', 'mineDisplayService'];
    MinesweeperApp.GameController = GameController;
    var GameConfigController = (function () {
        function GameConfigController($stateParams, $scope) {
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
        return GameConfigController;
    }());
    // Controller to handle views related to config of minesweeper game. Relies on stateParams to pass user values
    // between GameConfig instances as well as to initialize the game
    GameConfigController.$inject = ['$stateParams', '$scope'];
    MinesweeperApp.GameConfigController = GameConfigController;
    var GameSize = (function () {
        function GameSize(x, y, name) {
            this.x = x;
            this.y = y;
            this.name = name;
        }
        return GameSize;
    }());
    var GameDifficulty = (function () {
        function GameDifficulty(difficulty, name) {
            this.difficulty = difficulty;
            this.name = name;
        }
        return GameDifficulty;
    }());
    var HomeController = (function () {
        function HomeController($scope) {
            this.$scope = $scope;
            this.$scope.title = 'Home';
            this.$scope.startGameMessage = "New Game";
            this.$scope.scoresMessage = "My High Scores";
        }
        return HomeController;
    }());
    // Simple controller to store messages for the Home view to either start game or view scores. 
    HomeController.$inject = ['$scope'];
    MinesweeperApp.HomeController = HomeController;
    var GameData = (function () {
        function GameData(x, y, difficulty) {
            this.x = x;
            this.y = y;
            this.difficulty = difficulty;
            this.mineCount = Math.floor(this.difficulty * this.x * this.y);
            this.isSolved = false;
            this.gameFailed = false;
            this.timeCount = 0;
        }
        return GameData;
    }());
    var ScoreController = (function () {
        function ScoreController() {
        }
        return ScoreController;
    }());
    MinesweeperApp.ScoreController = ScoreController;
})(MinesweeperApp || (MinesweeperApp = {}));
// App modelled after: https://github.com/ricardocanelas/angularjs-typescript-sample-app/blob/master/app/src/services/companyService.ts
var MinesweeperApp;
(function (MinesweeperApp) {
    var GameService = (function () {
        function GameService($q) {
            this.$q = $q;
            console.log("Game service init!!");
            this.mineValue = -1;
            this.markedValue = -2;
        }
        GameService.prototype.loadGame = function (x, y, mineCount) {
            // TODO create the array to be undefined
            var game = Array(y).slice().map(function (i) { return Array(x); });
            var randX, randY;
            // Randomly pick indices
            while (mineCount > 0) {
                randX = this.randomIntFromInterval(0, x);
                randY = this.randomIntFromInterval(0, y);
                if (!game[randX][randY]) {
                    game[randX][randY] = -1;
                    mineCount--;
                }
            }
            return game;
        };
        GameService.prototype.markMine = function (x, y, game) {
            // Return number used to update the number of mines marked versus total mines
            // return: amount to increment mineDisplayAmount
            if (game[y][x] != -2 && game[y][x] === undefined) {
                // Allow unselected squares to be marked only
                game[y][x] = this.markedValue;
                return -1;
            }
            else if (game[y][x] == -2) {
                // case to unmark squares
                game[y][x] = undefined;
                return 1;
            }
            else {
                return 0;
            }
        };
        GameService.prototype.makeMove = function (x, y, game) {
            // Move calculates if move is a mine (false == fail), else propagates choice until it hits non 0 value (0 mine around) places
            if (game[y][x] < 0 || game[y][x] === undefined) {
                if (game[y][x] == this.mineValue) {
                    return false;
                }
                else {
                    this.searchMove(x, y, game);
                    return true;
                }
            }
        };
        GameService.prototype.searchMove = function (x, y, game) {
            // Recursive helper to continue searching adjacent squares until it reaches one that is bordering a mine, at which point recursive calls stop
            var mines;
            for (var i = y - 1; i <= y + 1; i++) {
                for (var j = x - 1; j <= x + 1; j++) {
                    mines = this.countMines(i, j, game);
                    if (mines == 0 && game[j][i] === undefined) {
                        this.searchMove(j, i, game);
                    }
                    game[j][i] = mines;
                }
            }
        };
        GameService.prototype.countMines = function (x, y, game) {
            // Helper function to count the number of mines around a point (a total of 8 bordering squares)
            for (var i = y - 1; i <= y + 1; i++) {
                var bombCount = 0;
                for (var j = x - 1; j <= x + 1; j++) {
                    if ((j >= 0 && j < x) && (i >= 0 && i < y)) {
                        if (game[j][i] == this.mineValue) {
                            bombCount++;
                        }
                    }
                }
            }
            return bombCount;
        };
        GameService.prototype.isSolved = function (x, y, game) {
            // Checks to see if the current game is solved
            for (var i = 0; i < y; i++) {
                for (var j = 0; j < x; j++) {
                    if (game[j][i] === undefined) {
                        return false;
                    }
                }
            }
            return true;
        };
        GameService.prototype.solveGame = function (x, y, game) {
            for (var i = 0; i < y; i++) {
                for (var j = 0; j < x; j++) {
                    if (game[j][i] === undefined) {
                        game[j][i] = this.countMines(j, i, game);
                    }
                }
            }
        };
        GameService.prototype.randomIntFromInterval = function (min, max) {
            // Helper function to choose a random number between min and max
            // Used to choose a game[rand][rand] place for a bomb placement
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        return GameService;
    }());
    GameService.$inject = ['$q'];
    MinesweeperApp.GameService = GameService;
    angular.module('minesweeperApp').service('gameService', GameService);
    var MineDisplayService = (function () {
        function MineDisplayService($q) {
            this.$q = $q;
            this.baseClass = "square";
        }
        MineDisplayService.prototype.getClass = function (value, failedGame) {
            // Helper function to determine current state of a tile and return the class value for the square
            var displayClass;
            switch (value) {
                case -2:
                    displayClass = "marked-mine";
                    break;
                case -1:
                    if (failedGame) {
                        displayClass = "mine";
                    }
                    else {
                        displayClass = "blank";
                    }
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
            return this.baseClass + ' ' + displayClass;
        };
        return MineDisplayService;
    }());
    MineDisplayService.$inject = ['$q'];
    MinesweeperApp.MineDisplayService = MineDisplayService;
    angular.module('minesweeperApp').service('mineDisplayService', MineDisplayService);
})(MinesweeperApp || (MinesweeperApp = {}));
//# sourceMappingURL=appBundle.js.map