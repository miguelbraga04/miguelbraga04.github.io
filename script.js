//const { Message } = require("./paho-mqtt.min");

// Pick a random div by ID
const divIds = ["case1", "case2", "case3", "case4"];
const randomId = divIds[Math.floor(Math.random() * divIds.length)];
const selectedDiv = document.getElementById(randomId);
var unlockStatus = false;
// Show the selected div
selectedDiv.hidden = false;

//MQTT
clientID = "clientID - "+parseInt(Math.random() * 100);
host = "broker.hivemq.com"; //"broker.hivemq.com" //"test.mosquitto.org" //document.getElementById("host").value;       
port = 8000; //broker.hivemq.com 8000 //8884
const client = new Paho.Client("broker.hivemq.com", 8000, "clientID"); //client = new Paho.Client(host, Number(port), clientID);
client.onConnectionLost = function (responseObject) {
    console.log("Connection lost: " + responseObject.errorMessage);
};
client.onMessageArrived = function (message) {
    console.log("Message arrived: " + message.payloadString);
};

client.connect({ 
    useSSL: false, //useSSL true if 8884
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

            if (input === "test") {
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
        document.getElementById('title').innerHTML = "2";
        // JavaScript only for div 2
        window.onload = function() {
        buildGridOverlay();                      //Generates grid-overlay
        cellCreator(2, 0);
        directions();
        score(0);
        };


        /* GENERATE GRID */
        function buildGridOverlay() {
        var game    = document.getElementsByClassName('game');  
        var grid    = document.getElementsByClassName('grid');
        var size    = 4;
        var table   = document.createElement('DIV');

        table.className += 'grid';
        table.id = ' ';
        table.dataset.value = 0;
    
        for (var i = 0; i < size; i++) {
            var tr = document.createElement('DIV');
            table.appendChild(tr);
            tr.id = 'row_' + (i+1);
            tr.className += 'grid_row';
            
            for (var j = 0; j < size; j++) {
            var td = document.createElement('DIV');
            td.id = '' +(i+1) +(j+1);                            //ID with x y
            td.className += 'grid_cell';
            tr.appendChild(td);
            }
        document.body.appendChild(table);
        }
        //selectedDiv.appendChild(table);

        return table;
        }

        /* RANDOM TILE CREATOR */
        function cellCreator(c, timeOut) {
        /* do 2 times for 2 new tiles */
        for (var i = 0; i < c; i++) {
            
            var count = 0;
            /* search for an empty cell to create a tile */
            
            for (var value = 1; value < 2; value++) {
            var randomX = Math.floor((Math.random()*4)+1);
            var randomY = Math.floor((Math.random()*4)+1);
            var checker = document.getElementById('' +randomX +randomY);
            if (checker.innerHTML != '') {
                value = 0;
            } 
            }
            
            var randomValue = Math.floor((Math.random()*4) +1); //create value 1, 2, 3 or 4
            if (randomValue == 3) {randomValue=4};              //3 --> 4
            if (randomValue == 1) {randomValue=2};              //1 --> 2
            var position = document.getElementById(''+randomX +randomY);
            var tile = document.createElement('DIV');           //create div at x, y
            position.appendChild(tile);                         //tile becomes child of grid cell
            tile.innerHTML = ''+randomValue;                    //tile gets value 2 or 4
            
            colorSet(randomValue, tile);
            tile.data = ''+randomValue;
            tile.id = 'tile_'+randomX +randomY;
            position.className += ' active';
            var tileValue = tile.dataset.value;
            tile.dataset.value = ''+randomValue;
            
            console.info(''+timeOut);
            if (timeOut == 0) {
            tile.className = 'tile '+randomValue;
            } else { setTimeout(function() {
                tile.className = 'tile '+randomValue;
            }, 10); }
            break;
        }
        
        }

        /* MOVE TILES */
        document.onkeydown = directions;

        /* MOBILE CONTROLS */
        (function addSwipeControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const minSwipeDistance = 30; // minimum px distance for a valid swipe

        document.addEventListener('touchstart', function (e) {
            if (e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            }
        }, false);

        document.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;

            handleSwipeGesture();
        }, false);

        function handleSwipeGesture() {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Check if swipe is long enough
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;

            const fakeEvent = { keyCode: 0 }; // emulate keyboard event

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            fakeEvent.keyCode = deltaX > 0 ? 39 : 37; // right : left
            } else {
            // Vertical swipe
            fakeEvent.keyCode = deltaY > 0 ? 40 : 38; // down : up
            }

            directions(fakeEvent);
        }
        })();

        function directions(e) {
        e = e || window.event;
        var d = 0;
        // ----- KEY UP ----- //
            if (e.keyCode == '38') {      
            var count = 2;  
            
            for (var x = 2; x > 1; x--) {
                for (var y = 1; y < 5; y++) {
                moveTilesMain(x, y, -1, 0, 1, 0);
                console.info(''+x +y);
                }
                if (x == 2) {
                x += count;
                count++;
                }
                if (count > 4) { break; }
            }
            cellReset();
            }   
            
        // ----- KEY DOWN ----- //
            else if (e.keyCode == '40') { // down
            var count = -2;  
            var test  = 1;
            for (var x = 3; x < 4; x++) {
                for (var y = 1; y < 5; y++) {
                moveTilesMain(x, y, 1, 0, 4, 0);
                }
                if (x == 3) {
                x += count;
                count--;
                }
                if (count < -4) { break; }
            }
            cellReset();
            }
            
        // ----- KEY LEFT ----- //      
            
            else if (e.keyCode == '37') { // left
            
            
            var count = 2;  
            var test  = 1;
            for (var x = 2; x > 1; x--) {
                for (var y = 1; y < 5; y++) {
                moveTilesMain(y, x, 0, -1, 0, 1);
                }
                if (x == 2) {
                x += count;
                count++;
                }
                if (count > 4) { break; }
            }
            cellReset();
            }
        
        // ----- KEY RIGHT ----- //
            else if (e.keyCode == '39') { // right
            
            var count = -2;  
            var noCell = 0;
            var c = 1;
            var d = 0;
            
            for (var x = 3; x < 4; x++) {
                for (var y = 1; y < 5; y++) {
                moveTilesMain(y, x, 0, 1, 0, 4, c, d);
                }
                if (x == 3) {
                x += count;
                count--;
                }
                if (count < -4) { break; }
            }
            cellReset();
            }

        }

        //--------------------------------------------------------

        function moveTilesMain(x, y, X, Y, xBorder, yBorder, c, d) {      
        
        var tile     = document.getElementById('tile_'+x +y);
        var checker  = document.getElementById(''+x +y);
        var xAround  = x+X;
        var yAround  = y+Y;
        
        if (xAround > 0 && xAround < 5 && yAround > 0 && yAround < 5 && checker.className == 'grid_cell active') {
            var around = document.getElementById(''+xAround +yAround);
            
            //________
            
            if (around.className == 'grid_cell active') {
            //catching
            var aroundTile = document.getElementById('tile_'+xAround +yAround);
            if (aroundTile.innerHTML == tile.innerHTML) {
                //same
                var value = tile.dataset.value*2;
                aroundTile.dataset.value = ''+value;
                //BOX IS UNLOCKED AFTER REACHING 128
                if (value == 128) {
                    publishMessage();
                }
                aroundTile.className = 'tile '+value;
                aroundTile.innerHTML = ''+value;
                colorSet(value, aroundTile);
                checker.removeChild(tile);
                checker.className = 'grid_cell';
                around.className  = 'grid_cell active merged';
                document.getElementsByClassName('grid').id = 'moved';
                document.getElementsByClassName('grid').className = 'grid '+value;
                var grid = document.getElementById(' ');
                var scoreValue = parseInt(grid.dataset.value);
                var newScore = value + scoreValue;
                
                grid.dataset.value = newScore;
                var score = document.getElementById('value');
                
                score.innerHTML = ''+newScore;
            } 
            } else if (around.className == 'grid_cell'){
            //not catching
            around.appendChild(tile);
            around.className = 'grid_cell active';
            tile.id = 'tile_'+xAround +yAround;
            checker.className = 'grid_cell';
            document.getElementsByClassName('grid').id = 'moved';
            }
            
            
            //________
        }  
        }


        //-------------------------------------------------------


        function cellReset() {
        var count = 0;
        var a = document.getElementsByClassName('grid').id;
        console.log(''+a);
        
        for (var x=1; x<5; x++) {
            for (var y=1; y<5; y++) {
                var resetter = document.getElementById(''+x +y);
                if (resetter.innerHTML != '') {
                    count++;
                }
                
                if (resetter.innerHTML == '') {
                    resetter.className = 'grid_cell';
                } 
                
                if (resetter.className == 'grid_cell active merged') {
                    resetter.className = 'grid_cell active'
                }
            }
        }
        if (count == 16) {
            document.getElementById('status').className = 'lose';
        } else if (document.getElementsByClassName('grid').id == 'moved'){ 
            cellCreator(1, 1); 
        }
        document.getElementsByClassName('grid').id = ' ';
        }

        function score() {
            var grid = document.getElementById(' ');
            var value = grid.dataset.value;
            document.getElementById('value').innerHTML = ''+value;
        }


        /* ----- STYLE ----- */
        function colorSet(value, tile) {
        switch(value) {
            case 2:    tile.style.background = '#fbfced'; tile.style.color = 'black'; break;
            case 4:    tile.style.background = '#ecefc6'; tile.style.color = 'black'; break;
            case 8:    tile.style.background = '#ffb296'; tile.style.color = 'black'; break;
            case 16:   tile.style.background = '#ff7373'; tile.style.color = 'black'; break;
            case 32:   tile.style.background = '#f6546a'; tile.style.color = 'white'; break;
            case 64:   tile.style.background = '#8b0000'; tile.style.color = 'white'; break;
            case 128:  tile.style.background = '#794044'; tile.style.color = 'white'; 
                    tile.style.fontSize = '50px'; break;
            case 256:  tile.style.background = '#31698a'; tile.style.color = 'white';
                    tile.style.fontSize = '50px'; break;
            case 512:  tile.style.background = '#297A76'; tile.style.color = 'white';
                    tile.style.fontSize = '50px'; break;
            case 1024: tile.style.background = '#2D8A68'; tile.style.color = 'white';
                    tile.style.fontSize = '40px'; break;
            case 2048: tile.style.background = '#1C9F4E'; tile.style.color = 'white'; 
                    tile.style.fontSize = '40px'; 
                    document.getElementById('status').className = 'won'; break;
            case 4096: tile.style.background = '#468499'; tile.style.color = 'white'; 
                    tile.style.fontSize = '40px'; break;
            case 8192: tile.style.background = '#0E2F44'; tile.style.color = 'white';
                    tile.style.fontSize = '40px'; break;
        }
                            
        }

        function info() {
        setTimeout(function() {
            document.getElementById('description').classList.toggle('show');
        }, 10);  
        
        }

        function reset() {
        for (var x = 1; x < 5; x++) {
            for (var y = 1; y < 5; y++) {
            var resetter = document.getElementById(''+x +y);
            if (resetter.className == 'grid_cell active') {
                var tile = document.getElementById('tile_'+x +y);
                resetter.removeChild(tile);
            }
            }
        }
        document.getElementById('status').className = '';
        document.getElementById(' ').dataset.value = 0;
        score();
        cellReset();
        cellCreator(2, 0);
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
        selectedDiv.textContent = "Mysterybox has been unlocked!";
        console.log("Waiting for MQTT connection before sending message")
        /*while (client.isConnected() == false) {}*/
        setTimeout(() => {
            publishMessage();
        }, 3000); // 3000 milliseconds = 3 seconds
        //selectedDiv.style.fontWeight = "bold";
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
