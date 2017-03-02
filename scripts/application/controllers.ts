﻿module MinesweeperApp {
    export class GameController {
        // Controller to store game state and create wrapper functions for the GameService interface

        static $inject = ['$scope', '$stateParams', '$interval', 'gameService', 'mineDisplayService'];
        public $scope: ng.IScope;
        private $interval: ng.IIntervalService;
        private timeCounter: any;
        private gameService: IGameService;
        private mineDisplayService: IClassEnumService;
        public gameData: GameData;
        public game: Array<Array<number>>;

        constructor(
            $scope: ng.IScope,
            $stateParams: ng.ui.IStateParamsService,
            $interval: ng.IIntervalService,
            gameService: GameService,
            mineDisplayService: MineDisplayService
        ) {
            // Bind scope to controller fields
            $scope.vm = this;
            // Setup services
            this.gameService = gameService;
            this.mineDisplayService = mineDisplayService;
            // Setup Game
            this.gameData = new GameData($stateParams.x, $stateParams.y, $stateParams.difficulty);
            this.loadGame(this.gameData.x, this.gameData.y, this.gameData.difficulty);
            // Start game timer
            this.$interval = $interval;
            this.timeCounter = this.$interval(() => this.gameTimer(), 1000);
        }

        private loadGame(x: number, y: number, mineCount: number) {
            // Initalizes a game based on the size (x, y) and a difficulty (mine count)
            // this.$scope.game = this.gameService.loadGame(x, y, mineCount);
            this.game = this.gameService.loadGame(x, y, mineCount)
        }

        public makeMove(x: number, y: number): void {
            // Makes a move and changes game state through game service, then checks if it is solved
            if (!this.gameService.makeMove(x, y, this.game)) {
                this.failedGame();
            }
            this.gameData.isSolved = this.gameService.isSolved(
                this.gameData.x, this.gameData.y, this.game);
        }

        // use like <tag ng-class="getClass(x, y)"/>
        public getClass(x: number, y: number): string {
            // Wrapper to determine the style (class) of a square based on its state/mine value
            return this.mineDisplayService.getClass(this.game[x][y], this.gameData.gameFailed);
        }

        public markMine(x: number, y: number): void {
            // Player marks a square as a mine. Not activated as how does right clicking work on the app?
            this.gameData.mineDisplayCount += this.gameService.markMine(x, y, this.game);
        }

        private failedGame(): void {
            // Changed game state to failed, notifies view
            this.$interval.cancel(this.timeCounter);
            this.gameData.gameFailed = true;
        }

        // private gameTimer($scope: ng.IScope): void {
        private gameTimer(): void {
            // Function to be run in a setInterval to track time passed since game start
            // $scope.gameData.timeCount++;
            this.gameData.timeCount++;
        }
    }

    export class GameConfigController {
        // Controller to handle views related to config of minesweeper game. Relies on stateParams to pass user values
        // between GameConfig instances as well as to initialize the game

        static $inject = ['$stateParams', '$scope'];
        public $scope: ng.IScope
        private gameSizes: Array<any>;
        private gameDifficulties: Array<any>;
        public showDifficulties: boolean;

        constructor($stateParams: ng.ui.IStateParamsService, $scope: ng.IScope) {
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

    class GameSize {
        // Datatype to store game config data for board size (x * y) and a user label (size)
        public name: string;
        public x: number;
        public y: number;

        constructor(x: number, y: number, name: string) {
            this.x = x;
            this.y = y;
            this.name = name;
        }
    }

    class GameDifficulty {
        // Datatype to store game difficulty for game config. Diffculty is the percentage (i.e. 10 == 10% fo squares are bombs)
        public difficulty: number;
        public name: string;

        constructor(difficulty: number, name: string) {
            this.difficulty = difficulty;
            this.name = name;
        }
    }

    export class HomeController {
        // Simple controller to store messages for the Home view to either start game or view scores. 
        static $inject = ['$scope'];
        public startGameMessage: string;
        public scoresMessage: string;
        public $scope: ng.IScope;

        constructor($scope: ng.IScope) {
            this.$scope = $scope;
            this.$scope.title = 'Home';
            this.$scope.startGameMessage = "New Game";
            this.$scope.scoresMessage = "My High Scores";
        }
    }

    class GameData {
        // Wrapper type to group game state data together in a single object
        public x: number;
        public y: number;
        public gameFailed: boolean;
        public isSolved: boolean;
        public difficulty: number;
        public mineCount: number;
        public mineDisplayCount: number;
        public timeCount: number;

        constructor(x: number, y: number, difficulty: number) {
            this.x = x;
            this.y = y;
            this.difficulty = difficulty;
            this.mineCount = Math.floor(this.difficulty * this.x * this.y);
            this.isSolved = false;
            this.gameFailed = false;
            this.timeCount = 0;
        }
    }

    export class ScoreController {
        // TODO score controller to track and view data for the user's games
    }
}