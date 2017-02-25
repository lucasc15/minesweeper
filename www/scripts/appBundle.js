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
    /*var routeConfig = function ($routeProvider: ng.route.IRouteProvider) {
        $routeProvider
            .when('/', {
                templateUrl: "templates/home.html",
                controller: HomeController
            })
            .when('/home', {
                templateUrl: "templates/home.html",
                controller: HomeController
            })
            .when('/game-config', {
                templateUrl: "templates/game-config.html",
                controller: GameConfigController
            })
            .when('/game-config/:x/:y', {
                templateUrl: "templates/game-config.html",
                controller: GameConfigController
            })
            .when('/game/:x/:y/:difficulty', {
                templateUrl: "templates/game.html",
                controller: GameController
            })
            .when('/scores', {
                templateUrl: "templates/scores.html",
                controller: ScoreController
            })
    }
    routeConfig.$inject = ['$routeProvider']*/
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
            .state('game-config', {
            url: '/game-config',
            templateUrl: "templates/game-config.html",
            controller: MinesweeperApp.GameConfigController
        })
            .state('game-config-diff', {
            url: '/game-config/:x/:y',
            templateUrl: "templates/game-config.html",
            controller: MinesweeperApp.GameConfigController
        })
            .state('game', {
            url: '/game/:x/:y/:difficulty',
            templateUrl: "templates/game.html",
            controller: MinesweeperApp.GameController
        })
            .state('score', {
            url: '/scores',
            templateUrl: "templates/score.html",
            controller: MinesweeperApp.ScoreController
        });
    };
    routeConfig.$inject = ['$stateProvider'];
    angular.module('minesweeperApp', ['ui.router', 'ngRoute'])
        .controller('homeController', MinesweeperApp.HomeController)
        .controller('gameConfigController', MinesweeperApp.GameConfigController)
        .controller('gameController', MinesweeperApp.GameController)
        .controller('scoreController', MinesweeperApp.ScoreController)
        .service('gameService', MinesweeperApp.GameService)
        .config(routeConfig);
})(MinesweeperApp || (MinesweeperApp = {}));
var MinesweeperApp;
(function (MinesweeperApp) {
    var GameController = (function () {
        function GameController($routeParams, $interval, gameService, mineDisplayService) {
            // Use URL angular route to accept these values to start a new game
            // services/dependencies to register with the controller
            this.gameService = gameService;
            this.mineDisplayService = mineDisplayService;
            this.$interval = $interval;
            this.timeCounter = $interval(this.gameTimer, 1000);
            // Game config data
            this.x = parseInt($routeParams['x']);
            this.y = parseInt($routeParams['y']);
            this.difficulty = parseInt($routeParams['difficulty']) / 100;
            this.mineCount = this.mineDisplayCount = Math.floor(this.difficulty * this.x * this.y);
            // Game state settings/loading
            this.loadGame(this.x, this.y, this.mineCount);
            this.gameFailed = false;
            this.gameIsSolved = false;
        }
        GameController.prototype.loadGame = function (x, y, mineCount) {
            this.gameService.loadGame(x, y, mineCount);
        };
        GameController.prototype.makeMove = function (x, y) {
            // Makes a move and changes game state through game service, then checks if it is solved
            if (!this.gameService.makeMove(x, y, this.game)) {
                this.failedGame();
            }
            if (this.gameService.isSolved(this.x, this.y, this.game)) {
                this.gameIsSolved = true;
            }
        };
        GameController.prototype.markMine = function (x, y) {
            // Player marks a square as a mine. Not activated as how does right clicking work on the app?
            this.mineDisplayCount += this.gameService.markMine(x, y, this.game);
        };
        // use like <tag ng-class="getMineDisplay(x, y)"/>
        GameController.prototype.getMineDisplay = function (x, y) {
            // Uses a service related to the game service that applies the class to display every game square
            return this.mineDisplayService.getClass(this.game[x][y], this.gameFailed);
        };
        GameController.prototype.failedGame = function () {
            // Changed game state to failed, notifies view
            this.$interval.cancel(this.timeCounter);
            this.gameFailed = true;
        };
        GameController.prototype.gameTimer = function () {
            // Function to be run in a setInterval to track time passed since game start
            this.timeCount++;
        };
        return GameController;
    }());
    GameController.$inject = ['gameService', 'MineDisplayService', "$interval", '$routeParams'];
    MinesweeperApp.GameController = GameController;
    var GameConfigController = (function () {
        function GameConfigController($routeParams) {
            this.x = $routeParams['x'];
            this.y = $routeParams['y'];
            this.showDifficultiesScreen = (this.x != undefined && this.y != undefined);
            this.gameSizes = [
                new GameSize(10, 10, "Small (10 x 10)"),
                new GameSize(10, 20, "Medium (10 X 20)"),
                new GameSize(10, 30, "Large (10 x 30)")
            ];
            this.gameDifficulties = [
                new GameDifficulty(10, "Easy"),
                new GameDifficulty(20, "Medium"),
                new GameDifficulty(30, "Hard")
            ];
        }
        return GameConfigController;
    }());
    MinesweeperApp.GameConfigController = GameConfigController;
    var GameSize = (function () {
        function GameSize(x, y, size) {
            this.x = x;
            this.y = y;
            this.size = size;
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
            this.$scope.startGameMessage = "New Game";
            this.$scope.scoresMessage = "My High Scores";
        }
        return HomeController;
    }());
    // Simple controller to store messages for the Home view to either start game or view scores. 
    HomeController.$inject = ['$scope'];
    MinesweeperApp.HomeController = HomeController;
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
            this.mineValue = -1;
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
            if (game[x][y] != -2 && game[x][y] === undefined) {
                // Allow unselected squares to be marked only
                game[x][y] = -2;
                return -1;
            }
            else if (game[x][y] == -2) {
                // case to unmark squares
                game[x][y] = undefined;
                return 1;
            }
            else {
                return 0;
            }
        };
        GameService.prototype.makeMove = function (x, y, game) {
            // Move calculates if move is a mine (false == fail), else propagates choice until it hits non 0 value (0 mine around) places
            if (game[x][y] < 0 || game[x][y] === undefined) {
                if (game[x][y] == this.mineValue) {
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
                    mines = this.mineCount(i, j, game);
                    if (mines == 0 && game[i][j] === undefined) {
                        this.searchMove(i, j, game);
                    }
                    game[i][j] = mines;
                }
            }
        };
        GameService.prototype.mineCount = function (x, y, game) {
            // Helper function to count the number of mines around a point (a total of 8 bordering squares)
            for (var i = y - 1; i <= y + 1; i++) {
                var bombCount = 0;
                for (var j = x - 1; j <= x + 1; j++) {
                    if ((j >= 0 && j < x) && (i >= 0 && i < y)) {
                        if (game[i][j] == this.mineValue) {
                            bombCount++;
                        }
                    }
                }
            }
            return bombCount;
        };
        GameService.prototype.isSolved = function (x, y, game) {
            for (var i = 0; i < x; i++) {
                for (var j = 0; j < y; j++) {
                    if (game[i][j] === undefined) {
                        return false;
                    }
                }
            }
            return true;
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
    var MineDisplayService = (function () {
        function MineDisplayService() {
        }
        // Helper function to determine current state of a tile and return the class value for the square
        MineDisplayService.prototype.getClass = function (value, failedGame) {
            switch (value) {
                case -2:
                    return "marked-mine";
                case -1:
                    if (failedGame) {
                        return "mine";
                    }
                    return "blank";
                case 0:
                    return "no-mine";
                case 1:
                    return "one-mine";
                case 2:
                    return "two-mine";
                case 3:
                    return "three-mine";
                case 4:
                    return "four-mine";
                case 5:
                    return "five-mine";
                case 6:
                    return "six-mine";
                case 7:
                    return "seven-mine";
                case 8:
                    return "eight-mine";
                default:
                    return "blank";
            }
        };
        return MineDisplayService;
    }());
    MinesweeperApp.MineDisplayService = MineDisplayService;
})(MinesweeperApp || (MinesweeperApp = {}));
//# sourceMappingURL=appBundle.js.map