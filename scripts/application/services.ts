// App modelled after: https://github.com/ricardocanelas/angularjs-typescript-sample-app/blob/master/app/src/services/companyService.ts
module MinesweeperApp {

    export interface IGameService {
        // Interface handles implementation of game logic, which the controller creates wrappers around
        // The service is also stateless, the controller passes a game state and remembers the game state.

        // Modifies reference of game board, and recursively searches a move to propagate areas with no bombs
        // Searching also calculates the number of bombs near uncovered areas.
        loadGame(x: number, y: number, difficulty: number): Array<Array<number>>;
        // Move is a wrapper that firswt decides if they lost, and if not, propagates a 
        // choice out show all continuous squares with no bombs
        makeMove(x: number, y: number, game: Array<Array<number>>): boolean;
        // Function to mark a suspected mine
        markMine(x: number, y: number, game: Array<Array<number>>): number;
        // Function to check if the game is solved
        isSolved(x: number, y: number, game: Array<Array<number>>): boolean;
        // This is the service value that represents a bomb, selected to be -1;
        mineValue: number;

        /* Mine values:
            -2:         Marked Mine: will display a black square with a 'flag' marker; need to figure out cursor ui
            -1:         Mine: will remain covered until gameState = failed
            undefined:  Covered/unknown by player
            1:          1 Mine
            N:          N Mines, 1 <= N <= 8
        */
    }

    export class GameService implements IGameService {
        static $inject = ['$q'];
        mineValue = -1;
        markedValue = -2;

        constructor(private $q: ng.IQService) {
        }

        loadGame(x: number, y: number, mineCount: number): Array<Array<number>> {
            // TODO create the array to be undefined
            var game = [...Array(y)].map(i => Array(x));
            var randX: number, randY: number;
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
        }

        markMine(x: number, y: number, game: Array<Array<number>>): number {
            // Return number used to update the number of mines marked versus total mines
            // return: amount to increment mineDisplayAmount
            if (game[y][x] != -2 && game[y][x] === undefined) {
                // Allow unselected squares to be marked only
                game[y][x] = this.markedValue;
                return -1;
            } else if (game[y][x] == -2) {
                // case to unmark squares
                game[y][x] = undefined;
                return 1;
            } else {
                return 0;
            }
        } 

        makeMove(x: number, y: number, game: Array<Array<number>>): boolean {
            // Move calculates if move is a mine (false == fail), else propagates choice until it hits non 0 value (0 mine around) places
            if (game[y][x] < 0 || game[y][x] === undefined) {
                if (game[y][x] == this.mineValue) {
                    return false;
                } else {
                    this.searchMove(x, y, game);
                    return true;
                }
            }
        }

        searchMove(x: number, y: number, game: Array<Array<number>>): void {
            // Recursive helper to continue searching adjacent squares until it reaches one that is bordering a mine, at which point recursive calls stop
            var mines: number;
            for (var i = y - 1; i <= y + 1; i++) {
                for (var j = x - 1; j <= x + 1; j++) {
                    mines = this.countMines(i, j, game);
                    if (mines == 0 && game[j][i] === undefined) {
                        this.searchMove(j, i, game);
                    }
                    game[j][i] = mines;
                }
            }
        }

        private countMines(x: number, y: number, game: Array<Array<number>>): number {
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
        }

        public isSolved(x: number, y: number, game: Array<Array<number>>) {
            // Checks to see if the current game is solved
            for (var i = 0; i < y; i++) {
                for (var j = 0; j < x; j++) {
                    if (game[j][i] === undefined) {
                        return false;
                    }
                }
            }
            return true;
        }

        public solveGame(x: number, y: number, game: Array<Array<number>>): void {
            for (var i = 0; i < y; i++) {
                for (var j = 0; j < x; j++) {
                    if (game[j][i] === undefined) {
                        game[j][i] = this.countMines(j, i, game)
                    }
                }
            }
        }

        private randomIntFromInterval(min: number, max: number) {
            // Helper function to choose a random number between min and max
            // Used to choose a game[rand][rand] place for a bomb placement
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }

    export interface IClassEnumService {
        // Interface to determine the display of a square based on its mine value. Display is defined in game.css
        getClass(value: number, failedGame: boolean): string;
        baseClass: string;
    }

    export class MineDisplayService {

        baseClass: string;

        constructor() {
            this.baseClass = "square";
        }

        getClass(value: number, failedGame: boolean): string {
            // Helper function to determine current state of a tile and return the class value for the square
            var displayClass: string;
            switch (value) {
                case -2:
                    displayClass = "marked-mine";
                    break;
                case -1:
                    if (failedGame) {
                        displayClass = "mine";
                    } else {
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
                    displayClass = "eight-mine"
                    break;
                default:
                    displayClass = "blank"
            }
            return this.baseClass + ' ' + displayClass;
        }
    }
}