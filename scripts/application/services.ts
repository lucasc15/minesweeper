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
            -2:         Marked Mine
            -1:         Mine
            undefined:  Covered
            1:          1 Mine
            N:          N Mines
        */
    }

    export class GameService implements IGameService {
        static $inject = ['$q'];
        mineValue = -1;

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
            if (game[x][y] != -2 && game[x][y] === undefined) {
                // Allow unselected squares to be marked only
                game[x][y] = -2;
                return -1;
            } else if (game[x][y] == -2) {
                // case to unmark squares
                game[x][y] = undefined;
                return 1;
            } else {
                return 0;
            }
        } 

        makeMove(x: number, y: number, game: Array<Array<number>>): boolean {
            // Move calculates if move is a mine (false == fail), else propagates choice until it hits non 0 value (0 mine around) places
            if (game[x][y] < 0 || game[x][y] === undefined) {
                if (game[x][y] == this.mineValue) {
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
                    mines = this.mineCount(i, j, game);
                    if (mines == 0 && game[i][j] === undefined) {
                        this.searchMove(i, j, game);
                    }
                    game[i][j] = mines;
                }
            }
        }

        private mineCount(x: number, y: number, game: Array<Array<number>>): number {
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
        }

        public isSolved(x: number, y: number, game: Array<Array<number>>) {
            // Checks to see if the current game is solved
            for (var i = 0; i < x; i++) {
                for (var j = 0; j < y; j++) {
                    if (game[i][j] === undefined) {
                        return false;
                    }
                }
            }
            return true;
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
    }

    export class MineDisplayService {
        // Helper function to determine current state of a tile and return the class value for the square
        getClass(value: number, failedGame: boolean): string {
            switch (value) {
                case -2:
                    return "marked-mine";
                case -1:
                    if (failedGame) {
                        return "mine";
                    }
                    return "blank";
                case 0:
                    return "no-mine"
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
                    return "eight-mine"
                default:
                    return "blank"
            }
        }
    }
}