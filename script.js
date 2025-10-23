//const { Message } = require("./paho-mqtt.min");

// Pick a random div by ID
const divIds = ["case1", "case2", "case3", "case4", "case5"];
const randomId = divIds[Math.floor(Math.random() * divIds.length)];
console.log(randomId);
const selectedDiv = document.getElementById(randomId);
var unlockStatus = false;
// Show the selected div
selectedDiv.hidden = false;

//MQTT
clientID = "clientID - "+parseInt(Math.random() * 100);
host = "broker.hivemq.com"; //"broker.hivemq.com" //"test.mosquitto.org" //document.getElementById("host").value;       
port = 8884; //broker.hivemq.com 8000 //8884
const client = new Paho.Client("broker.hivemq.com", 8884, "clientID"); //client = new Paho.Client(host, Number(port), clientID);
client.onConnectionLost = function (responseObject) {
    console.log("Connection lost: " + responseObject.errorMessage);
};
client.onMessageArrived = function (message) {
    console.log("Message arrived: " + message.payloadString);
};

client.connect({ 
    useSSL: true, //useSSL true if 8884
    keepAliveInterval: 60,
    onSuccess: onConnect,
    onFailure: function (error) {
        console.error("Connection failed:", error.errorMessage);
    }
 });

// Run logic *only* for that div
switch (randomId) {
    //Question with freetext answer
    case "case1":
        document.getElementById('title').innerHTML = "1";
        
        //injecting the form contents into the selectedDiv
        /*selectedDiv.innerHTML = ``;*/
        document.getElementById("checkForm").addEventListener("submit", function(event){
            event.preventDefault(); // prevent form from refreshing the page
            
            const input = document.getElementById("inputText").value.trim();
            const result = document.getElementById("result");

            if (input === "ihminen") {
                unlockStatus = true;
                result.textContent = "Correct!";
                publishMessage();
            } else {
                result.textContent = "Wrong!";
            }
        });
        break;

    //2048
    case "case2":
        var board;
        var score = 0;
        var rows = 4;
        var columns = 4;
        /*
        window.onload = function() {
            setGame();
        }
        */
        setGame();

        function setGame() {
            // board = [
            //     [2, 2, 2, 2],
            //     [2, 2, 2, 2],
            //     [4, 4, 8, 8],
            //     [4, 4, 8, 8]
            // ];

            board = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < columns; c++) {
                    let tile = document.createElement("div");
                    tile.id = r.toString() + "-" + c.toString();
                    let num = board[r][c];
                    updateTile(tile, num);
                    document.getElementById("board").append(tile);
                }
            }
            //create 2 to begin the game
            setTwo();
            setTwo();

        }

        function updateTile(tile, num) {
            tile.innerText = "";
            tile.classList.value = ""; //clear the classList
            tile.classList.add("tile");
            if (num > 0) {
                tile.innerText = num.toString();
                if (num <= 4096) {
                    tile.classList.add("x"+num.toString());
                } else {
                    tile.classList.add("x8192");
                }                
            }
        }

        document.addEventListener('keyup', (e) => {
            if (e.code == "ArrowLeft") {
                slideLeft();
                setTwo();
            }
            else if (e.code == "ArrowRight") {
                slideRight();
                setTwo();
            }
            else if (e.code == "ArrowUp") {
                slideUp();
                setTwo();

            }
            else if (e.code == "ArrowDown") {
                slideDown();
                setTwo();
            }
            document.getElementById("score").innerText = score;
        })


        // --- Swipe detection for touch devices ---
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const swipeThreshold = 100; // Minimum px movement to count as swipe

        document.addEventListener("touchstart", function(e) {
            const touch = e.changedTouches[0];
            touchStartX = touch.screenX;
            touchStartY = touch.screenY;
        }, false);

        document.addEventListener("touchend", function(e) {
            const touch = e.changedTouches[0];
            touchEndX = touch.screenX;
            touchEndY = touch.screenY;
            handleSwipe();
        }, false);

        function handleSwipe() {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) {
                return; // ignore tiny swipes
            }

            // horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    // Swipe Right
                    slideRight();
                    setTwo();
                } else {
                    // Swipe Left
                    slideLeft();
                    setTwo();
                }
            } else {
                // vertical swipe
                if (deltaY > 0) {
                    // Swipe Down
                    slideDown();
                    setTwo();
                } else {
                    // Swipe Up
                    slideUp();
                    setTwo();
                }
            }

            document.getElementById("score").innerText = score;
        }


        function filterZero(row){
            return row.filter(num => num != 0); //create new array of all nums != 0
        }

        function slide(row) {
            row = filterZero(row); //[2, 2, 2]
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] == row[i + 1]) {
                    row[i] *= 2;
                    row[i + 1] = 0;
                    score += row[i];

                    if (row[i] === 128) {
                        publishMessage();
                        document.getElementById("case2_msg").textContent = "Box unlocked!"
                    }
                }
            }
            row = filterZero(row); //[4, 2]
            while (row.length < columns) {
                row.push(0);
            }
            return row;
        }

        function slideLeft() {
            for (let r = 0; r < rows; r++) {
                let row = board[r];
                row = slide(row);
                board[r] = row;
                for (let c = 0; c < columns; c++){
                    let tile = document.getElementById(r.toString() + "-" + c.toString());
                    let num = board[r][c];
                    updateTile(tile, num);
                }
            }
        }

        function slideRight() {
            for (let r = 0; r < rows; r++) {
                let row = board[r];         //[0, 2, 2, 2]
                row.reverse();              //[2, 2, 2, 0]
                row = slide(row)            //[4, 2, 0, 0]
                board[r] = row.reverse();   //[0, 0, 2, 4];
                for (let c = 0; c < columns; c++){
                    let tile = document.getElementById(r.toString() + "-" + c.toString());
                    let num = board[r][c];
                    updateTile(tile, num);
                }
            }
        }

        function slideUp() {
            for (let c = 0; c < columns; c++) {
                let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
                row = slide(row);
                // board[0][c] = row[0];
                // board[1][c] = row[1];
                // board[2][c] = row[2];
                // board[3][c] = row[3];
                for (let r = 0; r < rows; r++){
                    board[r][c] = row[r];
                    let tile = document.getElementById(r.toString() + "-" + c.toString());
                    let num = board[r][c];
                    updateTile(tile, num);
                }
            }
        }

        function slideDown() {
            for (let c = 0; c < columns; c++) {
                let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
                row.reverse();
                row = slide(row);
                row.reverse();
                // board[0][c] = row[0];
                // board[1][c] = row[1];
                // board[2][c] = row[2];
                // board[3][c] = row[3];
                for (let r = 0; r < rows; r++){
                    board[r][c] = row[r];
                    let tile = document.getElementById(r.toString() + "-" + c.toString());
                    let num = board[r][c];
                    updateTile(tile, num);
                }
            }
        }

        function setTwo() {
            if (!hasEmptyTile()) {
                return;
            }
            let found = false;
            while (!found) {
                //find random row and column to place a 2 in
                let r = Math.floor(Math.random() * rows);
                let c = Math.floor(Math.random() * columns);
                if (board[r][c] == 0) {
                    board[r][c] = 2;
                    let tile = document.getElementById(r.toString() + "-" + c.toString());
                    tile.innerText = "2";
                    tile.classList.add("x2");
                    found = true;
                }
            }
        }

        function hasEmptyTile() {
            let count = 0;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < columns; c++) {
                    if (board[r][c] == 0) { //at least one zero in the board
                        return true;
                    }
                }
            }
            return false;
        }
        break;
    case "case3":
        document.getElementById('title').innerHTML = "3";

        // määritellään peli vain jos tämä div aktivoituu
        function play(playerChoice) {
        const choices = ["✊", "✌️", "🖐️"];
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        let resultText = `Sinä: ${playerChoice} | Tietokone: ${computerChoice}. `;

        if (playerChoice === computerChoice) {
            resultText += "Tasapeli 🤝";
        } else if (
            (playerChoice === "✊" && computerChoice === "✌️") ||
            (playerChoice === "✌️" && computerChoice === "🖐️") ||
            (playerChoice === "🖐️" && computerChoice === "✊")
        ) {
            resultText += "Voitit 🎉";
            unlockStatus = true;
            publishMessage();
        } else {
            resultText += "Tietokone voitti 😅";
        }

        document.getElementById("rpsResult").textContent = resultText;
        }
        break;
    
    case "case4":
        document.getElementById('title').innerHTML = "4";
        document.getElementById("case4Form").addEventListener("submit", function(event){
            event.preventDefault(); // prevent form from refreshing the page
            if (client.isConnected() === true) {
                publishMessage();
                document.getElementById("case4_msg").textContent = "Box unlocked"
            } else {
                document.getElementById("case4_msg").textContent = "Waiting for MQTT connection before sending message. Try again."
                /*console.log("Waiting for MQTT connection before sending message. Try again.")*/
            }
        });
        /*selectedDiv.textContent = "Mysterybox has been unlocked!";*/
        break;

    case "case5":
        document.getElementById('title').innerHTML = "5";

        let canvas = document.getElementById("game");
        let ctx = canvas.getContext("2d");  
        // draw on the screen to get the context, ask canvas  to get the 2d context

        // snake axis
        class SnakePart {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        }
        // speed of the game
        let speed = 7;
        // size and count of a tile 
        let tileCount = 20;
        let tileSize = canvas.width / tileCount - 2;
        // head of the snake
        let headX = 10;
        let headY = 10;
        let snakeParts = [];
        let tailLength = 2;
        // apple size
        let appleX = 5;
        let appleY = 5;
        // movement
        let inputsXVelocity = 0;
        let inputsYVelocity = 0;

        let xVelocity = 0;
        let yVelocity = 0;

        let snakeScore = 0;

        /*let gulpSound = new Audio("gulp.mp3");*/

        //game loop
        function drawGame() {
        xVelocity = inputsXVelocity;
        yVelocity = inputsYVelocity;

        changeSnakePosition();
        let result = isGameOver();
        if (result) {
            return;
        }

        clearScreen();

        checkAppleCollision();
        drawApple();
        drawSnake();

        drawScore();

        //score 5 to send unlock message
        if (snakeScore >= 5) {
            publishMessage();
            document.getElementById("case5_msg").textContent = "Box unlocked"
        }

        if (snakeScore > 5) {
            speed = 9;
        }
        if (snakeScore > 10) {
            speed = 11;
        }

        setTimeout(drawGame, 1000 / speed);
        }

        function isGameOver() {
        let gameOver = false;

        if (yVelocity === 0 && xVelocity === 0) {
            return false;
        }

        //walls
        if (headX < 0) {
            gameOver = true;
        } else if (headX === tileCount) {
            gameOver = true;
        } else if (headY < 0) {
            gameOver = true;
        } else if (headY === tileCount) {
            gameOver = true;
        }

        for (let i = 0; i < snakeParts.length; i++) {
            let part = snakeParts[i];
            if (part.x === headX && part.y === headY) {
            gameOver = true;
            break;
            }
        }

        if (gameOver) {
            ctx.fillStyle = "white";
            ctx.font = "50px Verdana";

            if (gameOver) {
            ctx.fillStyle = "white";
            ctx.font = "50px Verdana";

            var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop("0", " magenta");
            gradient.addColorStop("0.5", "blue");
            gradient.addColorStop("1.0", "red");
            // Fill with gradient
            ctx.fillStyle = gradient;

            ctx.fillText("Game Over!", canvas.width / 6.5, canvas.height / 2);
            }

            ctx.fillText("Game Over!", canvas.width / 6.5, canvas.height / 2);
        }

        return gameOver;

        }

        function drawScore() {
        ctx.fillStyle = "white";
        ctx.font = "10px Verdana";
        ctx.fillText("Score " + snakeScore, canvas.width - 50, 10);
        }

        function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function drawSnake() {
        ctx.fillStyle = "green";
        for (let i = 0; i < snakeParts.length; i++) {
            let part = snakeParts[i];
            ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
        }

        snakeParts.push(new SnakePart(headX, headY)); //put an item at the end of the list next to the head
        while (snakeParts.length > tailLength) {
            snakeParts.shift(); // remove the furthet item from the snake parts if have more than our tail size.
        }

        ctx.fillStyle = "orange";
        ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
        }

        function changeSnakePosition() {
        headX = headX + xVelocity;
        headY = headY + yVelocity;
        }

        function drawApple() {
        ctx.fillStyle = "red";
        ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
        }

        function checkAppleCollision() {
        if (appleX === headX && appleY == headY) {
            appleX = Math.floor(Math.random() * tileCount);
            appleY = Math.floor(Math.random() * tileCount);
            tailLength++;
            snakeScore++;
            /*gulpSound.play();*/
        }
        }

        document.body.addEventListener("keydown", keyDown);

        function keyDown(event) {
        //up
        if (event.keyCode == 38 || event.keyCode == 87) {
            //87 is w
            if (inputsYVelocity == 1) return;
            inputsYVelocity = -1;
            inputsXVelocity = 0;
        }

        //down
        if (event.keyCode == 40 || event.keyCode == 83) {
            // 83 is s
            if (inputsYVelocity == -1) return;
            inputsYVelocity = 1;
            inputsXVelocity = 0;
        }

        //left
        if (event.keyCode == 37 || event.keyCode == 65) {
            // 65 is a
            if (inputsXVelocity == 1) return;
            inputsYVelocity = 0;
            inputsXVelocity = -1;
        }

        //right
        if (event.keyCode == 39 || event.keyCode == 68) {
            //68 is d
            if (inputsXVelocity == -1) return;
            inputsYVelocity = 0;
            inputsXVelocity = 1;
        }
        }

        drawGame();
                break;
        }

        function onConnect() {
            console.log("Connected to MQTT broker");
            // Now it's safe to publish
        }

        function isConnected() {
            return client && client.isConnected();
        }

        function publishMessage(){
            msg = "UNLOCK"
            topic = "mysterybox";
            Message = new Paho.Message(msg);
            Message.destinationName = topic;
            //client.send(Message);
            if (client.isConnected()) {
                client.publish(topic, msg);
                console.log("Message \"" +msg+ "\" to topic \"" +topic+ "\" is sent");
            } else {
                console.log("MQTT client not connected yet.");
            }
}
