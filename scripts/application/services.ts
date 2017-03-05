// App modelled after: https://github.com/ricardocanelas/angularjs-typescript-sample-app/blob/master/app/src/services/companyService.ts
module MinesweeperApp {

    export interface IGameService {
        // Interface handles implementation of game logic, which the controller creates wrappers around
        // The service is also stateless, the controller passes a game state and remembers the game state.
        // Modifies reference of game board, and recursively searches a move to propagate areas with no bombs
        // Searching also calculates the number of bombs near uncovered areas.

        // Constructor Params for game size
        loadGame(mineCount: number): Array<Array<number>>;
        // Set game size for individual instance of the game service
        setGameSize(x: number, y: number): void;
        // Move is a wrapper that firswt decides if they lost, and if not, propagates a 
        // choice out show all continuous squares with no bombs
        makeMove(x: number, y: number, game: Array<Array<number>>): boolean;
        // Function to mark a suspected mine
        markMine(x: number, y: number, game: Array<Array<number>>): number;
        // Function to update mine count if improperly flagged circle
        updateMineCount(game: Array<Array<number>>): number;
        // Function to check if the game is solved
        isSolved(game: Array<Array<number>>): boolean;
        // Function to restart the game
        resetGame(game: Array<Array<number>>): void;
        // This is the service value that represents a bomb, selected to be -1;
        mineValue: number;

        /* Mine values:
            -3:         Marked Mine that is a Mine: will display marked flag on a mine;
            -2:         Marked Mine: will display a black square with a 'flag' marker; need to figure out cursor ui
            -1:         Mine: will remain covered until gameState = failed
            undefined:  Covered/unknown by player
            1:          1 Mine
            N:          N Mines, 1 <= N <= 8
        */
    }

    export class GameService implements IGameService {
        static $inject = ['$q'];
        public mineValue: number;
        public markedValue: number;
        public markedMineValue: number;
        private sizeX: number;
        private sizeY: number;

        constructor(private $q: ng.IQService) {
            this.mineValue = -1;
            this.markedValue = -2;
            this.markedMineValue = -3;
        }

        loadGame(mineCount: number): Array<Array<number>> {
            var game = this.createEmptyArray(this.sizeX, this.sizeY);
            var randX: number, randY: number;
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

        markMine(x: number, y: number, game: Array<Array<number>>): number {
            // Return number used to update the number of mines marked versus total mines
            // return: amount to increment mineDisplayAmount
            if (game[y][x] != this.markedValue && game[y][x] != this.markedMineValue && game[y][x] === undefined) {
                // Allow unselected squares to be marked only
                game[y][x] = this.markedValue;
                return -1;
            } else if (game[y][x] == this.markedValue) {
                // case to unmark squares
                game[y][x] = undefined;
                return 1;
            } else if (game[y][x] == this.markedMineValue) {
                game[y][x] = this.mineValue;
            } else if (game[y][x] == this.mineValue) {
                game[y][x] = this.markedMineValue;
                return -1;
            } else {
                return 0;
            }
        }

        makeMove(x: number, y: number, game: Array<Array<number>>): boolean {
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

        searchMove(x: number, y: number, game: Array<Array<number>>, searched: Array<Array<boolean>>): void {
            // Recursive helper to continue searching adjacent squares until it reaches one that is bordering a mine, at which point recursive calls stop
            var mines: number;
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

        private countMines(x: number, y: number, game: Array<Array<number>>): number {
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

        public isSolved(game: Array<Array<number>>) {
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

        public solveGame(game: Array<Array<number>>): void {
            for (var i = 0; i < this.sizeY; i++) {
                for (var j = 0; j < this.sizeX; j++) {
                    if (game[i][j] === undefined) {
                        game[i][j] = this.countMines(j, i, game)
                    }
                }
            }
        }

        public updateMineCount(game: Array<Array<number>>): number {
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

        private randomIntFromInterval(min: number, max: number) {
            // Helper function to choose a random number between min and max
            // Used to choose a game[rand][rand] place for a bomb placement
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        private createEmptyArray(x: number, y: number): Array<Array<number>> {
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

        private createEmptyBooleanArray(x: number, y: number): Array<Array<boolean>> {
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

        public setGameSize(x: number, y: number): void {
            // Helper function to set a reference to a game size;
            this.sizeX = x;
            this.sizeY = y;
        }

        public resetGame(game: Array<Array<number>>): void {
            for (var i = 0; i < this.sizeY; i++) {
                for (var j = 0; j < this.sizeX; j++) {
                    if (game[i][j] != this.mineValue) {
                        game[i][j] = undefined;
                    }
                }
            }
        }
    }
    // Need to register service to app in this file, otherwise it is undefined in angularJS for some reason
    angular.module('minesweeperApp').service('gameService', GameService);
    

    export interface IClassEnumService {
        // Interface to determine the display of a square based on its mine value. Display is defined in game.css
        getClass(value: number, failedGame: boolean): string;
    }

    export class MineDisplayService implements IClassEnumService {

        static $inject = ['$q'];

        constructor(private $q: ng.IQService) {
        }

        getClass(value: number, failedGame: boolean): string {
            // Helper function to determine current state of a tile and return the class value for the square
            var displayClass: string;
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
                    } else {
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
                    displayClass = "eight-mine"
                    break;
                default:
                    displayClass = "blank"
            }
            return displayClass;
        }
    }
    angular.module('minesweeperApp').service('mineDisplayService', MineDisplayService);
}