const gameBoard = (() => {
    let gameBoardArr = ["", "", "", "", "", "", "", "", ""];

    const getBoardArr = () => gameBoardArr;

    const cleanGameBoard = () => {
        gameBoardArr = ["", "", "", "", "", "", "", "", ""];
    };

    const init = () => {
        cacheDom();
        render();
    };

    const cacheDom = () => {
        this.$content = $('.content');
        this.$board = this.$content.find('.tictactoe').find('p');
    };

    const render = (player) => {
        if (player != undefined && player.getPositions().length > 0) {
            for (let index = 0; index < player.getPositions().length; index++) {
                gameBoardArr[player.getPositions()[index]] = player.getChose();
            }
        }
        for (let index = 0; index < this.$board.length; index++) {
            this.$board.eq(index).html(gameBoardArr[index]);
        }
    };

    const endGame = () => {
        for (let index = 0; index < gameBoardArr.length; index++) {
            if (gameBoardArr[index] == "") {
                gameBoardArr[index] = "-";
            }
        }
    };


    return { render, init, getBoardArr, cleanGameBoard, endGame }
})();


const Player = (chose) => {
    let positions = [];
    const getPositions = () => positions;
    const cleanPositions = () => {
        positions = [];
    }
    const getChose = () => chose;
    const playerTurn = position => {
        positions.push(position);
    };
    return { getPositions, getChose, playerTurn, cleanPositions }
};


const gameFlow = (() => {
    let user = Player("X");
    let enemy = Player("O");
    let cont = 0;
    let difficulty = "easy";

    const init = () => {
        cacheDom();
        bindEvents();
        gameBoard.init();
        this.$playerX.css({
            "background-color": "white",
            color: "black",
            border: "3px solid black",
            cursor: "pointer"
        });
        this.$easy.css({
            "background-color": "white",
            color: "black",
            border: "3px solid black",
            cursor: "pointer"
        });

    };

    const restart = () => {
        this.$result.css({ display: "none" });
        gameBoard.cleanGameBoard();
        gameBoard.init();
        user.cleanPositions();
        enemy.cleanPositions();
        if (user.getChose() == "O") {
            enemy.playerTurn(machineMovement()); //si player es 0, maquina juega    
            gameBoard.render(enemy);
            cont = 2;
        } else {
            cont = 0;
        }
    };

    const cacheDom = () => {
        this.$content = $('.content');
        this.$playerX = this.$content.find('#playerX');
        this.$playerO = this.$content.find('#playerO');
        this.$board = this.$content.find('.tictactoe').find('button');
        this.$start = this.$content.find('.start')
        this.$result = this.$content.find('.result')
        this.$easy = this.$content.find('#easy')
        this.$hard = this.$content.find('#hard')
    };

    const bindEvents = () => {
        this.$board.on('click', turn);
        this.$start.on('click', restart);
        this.$playerX.on('click', selectPlayer);
        this.$playerO.on('click', selectPlayer);
        this.$easy.on('click', changeDifficulty);
        this.$hard.on('click', changeDifficulty);
    };

    const turn = (event) => {
        let whoPlay = (cont % 2 == 0) ? user : enemy;
        if (event.target.id != null) {
            whoPlay.playerTurn(event.target.id);
            gameBoard.render(whoPlay);
            if (checkWinner(whoPlay)) {
                this.$result.eq(0).html("YOU WIN!");
                this.$result.css({ display: "flex" });
                gameBoard.endGame();
                gameBoard.render();
            }
            cont++;
        }

        enemy.playerTurn(machineMovement());
        gameBoard.render(enemy);
        if (checkWinner(enemy)) {
            this.$result.eq(0).html("YOU LOSE!");
            this.$result.css({ display: "flex" });
            gameBoard.endGame();
            gameBoard.render();
        }
        cont++;
    };

    const changeDifficulty = (event) => {
        //event.currentTarget.id == "playerX"
        if (difficulty == "easy" && event.currentTarget.id == "hard") {
            this.$hard.css({
                "background-color": "white",
                color: "black",
                border: "3px solid black",
                cursor: "pointer"
            });
            this.$easy.css({
                "background-color": "black",
                color: "white",
                border: "3px solid white",
                cursor: "pointer"
            });
            difficulty = "hard";
        } else if (difficulty == "hard" && event.currentTarget.id == "easy") {
            this.$easy.css({
                "background-color": "white",
                color: "black",
                border: "3px solid black",
                cursor: "pointer"
            });
            this.$hard.css({
                "background-color": "black",
                color: "white",
                border: "3px solid white",
                cursor: "pointer"
            });
            difficulty = "easy";
        }
    };


    const machineMovement = () => {
        if (difficulty == "easy") {
            let boardArrAux = gameBoard.getBoardArr();
            let spacesAvailable = [];
            for (let index = 0; index < boardArrAux.length; index++) {
                if (boardArrAux[index] == "") {
                    spacesAvailable.push(index);
                }
            }
            let indexChose = Math.floor(Math.random() * spacesAvailable.length);
            return String(spacesAvailable[indexChose]);
        } else {
            let test = minimax(gameBoard.getBoardArr(),enemy.getChose());            
            return String(test.index);
        }
    };

    function minimax(newBoard, player) { //newBoard es un arreglo
        let spacesAvailable = [];
        for (let index = 0; index < newBoard.length; index++) {
            if (newBoard[index] == "") {
                spacesAvailable.push(index);
            }
        }

        if (winning(newBoard, user.getChose())) {
            return { score: -10 };
        }
        else if (winning(newBoard, enemy.getChose())) {
            return { score: 10 };
        }
        else if (spacesAvailable.length === 0) {
            return { score: 0 };
        }

        let moves = [];

        // loop through available spots
        for (let i = 0; i < spacesAvailable.length; i++) {
            //create an object for each and store the index of that spot 
            let move = {};
            move.index = spacesAvailable[i];
            let before = newBoard[spacesAvailable[i]]

            // set the empty spot to the current player
            newBoard[spacesAvailable[i]] = player;

            /*collect the score resulted from calling minimax 
              on the opponent of the current player*/
            if (player == enemy.getChose()) {
                let result = minimax(newBoard, user.getChose());
                move.score = result.score;
            }
            else {
                let result = minimax(newBoard, enemy.getChose());
                move.score = result.score;
            }

            // reset the spot to empty
            newBoard[spacesAvailable[i]] = before;

            // push the object to the array
            moves.push(move);
        }

        var bestMove;
        if (player === enemy.getChose()) {
            var bestScore = -10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {

            // else loop over the moves and choose the move with the lowest score
            var bestScore = 10000;
            for (var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        // return the chosen move (object) from the moves array
        
        
        return moves[bestMove];

    };

    const selectPlayer = (event) => {
        let playerSelected;
        let enemySelected;
        if (event == this.$playerX) {
            playerSelected = this.$playerX;
            enemySelected = this.$playerO;
            enemy = Player("X");
            user = Player("X");
            cont = 0;
        } else if (event.currentTarget.id == "playerX") {
            playerSelected = this.$playerX;
            enemySelected = this.$playerO;
            enemy = Player("O");
            user = Player("X");
            cont = 0;
        } else {
            playerSelected = this.$playerO;
            enemySelected = this.$playerX;
            enemy = Player("X");
            user = Player("O");
            cont = 1;
        }
        playerSelected.css({
            "background-color": "white",
            color: "black",
            border: "3px solid black",
            cursor: "pointer"
        });
        enemySelected.css({
            "background-color": "black",
            color: "white",
            border: "3px solid white",
            cursor: "pointer"
        });
        restart();
    };

    const checkWinner = (player) => {
        let newArrChoses = player.getPositions();
        //Check rows, columns and diagonals
        if (newArrChoses.includes("0") && newArrChoses.includes("1") && newArrChoses.includes("2") ||
            newArrChoses.includes("3") && newArrChoses.includes("4") && newArrChoses.includes("5") ||
            newArrChoses.includes("6") && newArrChoses.includes("7") && newArrChoses.includes("8")) {
            return true;
        } else if (newArrChoses.includes("0") && newArrChoses.includes("3") && newArrChoses.includes("6") ||
            newArrChoses.includes("1") && newArrChoses.includes("4") && newArrChoses.includes("7") ||
            newArrChoses.includes("2") && newArrChoses.includes("5") && newArrChoses.includes("8")) {
            return true;
        } else if (newArrChoses.includes("0") && newArrChoses.includes("4") && newArrChoses.includes("8") ||
            newArrChoses.includes("2") && newArrChoses.includes("4") && newArrChoses.includes("6")) {
            return true;
        } else {
            return false;
        }
    };

    function winning(board, player) {
        if (
            (board[0] == player && board[1] == player && board[2] == player) ||
            (board[3] == player && board[4] == player && board[5] == player) ||
            (board[6] == player && board[7] == player && board[8] == player) ||
            (board[0] == player && board[3] == player && board[6] == player) ||
            (board[1] == player && board[4] == player && board[7] == player) ||
            (board[2] == player && board[5] == player && board[8] == player) ||
            (board[0] == player && board[4] == player && board[8] == player) ||
            (board[2] == player && board[4] == player && board[6] == player)
        ) {
            return true;
        } else {
            return false;
        }
    }


    return { init, checkWinner, user, enemy }
})();

gameFlow.init();