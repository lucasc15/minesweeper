module MinesweeperApp {
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
        public markingCursor: boolean;
        public mineMarkerText: string;

        constructor(
            $scope: ng.IScope,
            $stateParams: ng.ui.IStateParamsService,
            $interval: ng.IIntervalService,
            gameService: GameService,
            mineDisplayService: MineDisplayService
        ) {
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

        private loadGame(mineCount: number) {
            // Initalizes a game based on the size (x, y) and a difficulty (mine count)
            this.game = this.gameService.loadGame(mineCount);
        }

        public makeMove(x: number, y: number): void {
            // Makes a move and changes game state through game service, then checks if it is solved
            // If is marking cursor mode
            if (this.markingCursor) {
                this.markMine(x, y);
                return
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
        public getClass(x: number, y: number): string {
            // Wrapper to determine the style (class) of a square based on its state/mine value
            return this.mineDisplayService.getClass(this.game[y][x], this.gameData.gameFailed);
        }

        public toggleMineMarker(): void {
            this.markingCursor = !this.markingCursor;
            this.mineMarkerText = (this.markingCursor) ?
                "Deactivate Marker" : "Activate Marker";
        }

        public getMineMarkerClass(): string {
            if (this.markingCursor) {
                return 'marker-activated button button-block button-positive';
            }
            return 'marker-deactivated button button-block button-calm';
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
            this.gameData.timeCount++;
        }

        private startTime(): void {
            this.timeCounter = this.$interval(() => this.gameTimer(), 1000);
        }

        private resetGame(): void {
            this.gameService.resetGame(this.game);
            this.gameData.timeCount = 0;
            this.startTime();
            this.gameData.gameFailed = false;
            this.gameData.isSolved = false;
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
            this.mineCount = this.mineDisplayCount =
                Math.floor(this.x * this.y * this.difficulty / 100);
            this.isSolved = false;
            this.gameFailed = false;
            this.timeCount = 0;
        }
    }

    export class ScoreController {
        // TODO score controller to track and view data for the user's games
    }
}