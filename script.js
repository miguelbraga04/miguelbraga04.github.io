//const { Message } = require("./paho-mqtt.min");

// Pick a random div by ID
const divIds = ["case1", "case2", "case3", "case4"];
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
        const swipeThreshold = 50; // Minimum px movement to count as swipe

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
        document.getElementById("checkForm").addEventListener("submit", function(event){
            event.preventDefault(); // prevent form from refreshing the page
            if (client.isConnected() === true) {
                publishMessage();
            } else {
                document.getElementById("case4_msg").textContent = "Odotetaan MQTT yhteyttä. Yritä uudelleen."
                /*console.log("Waiting for MQTT connection before sending message. Try again.")*/
            }
        });
        document.getElementById("case4_msg").textContent = "Laatikko avattu"
        /*selectedDiv.textContent = "Mysterybox has been unlocked!";*/
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
