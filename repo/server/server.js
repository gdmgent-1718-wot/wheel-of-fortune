let app = require('express')();
// let http = require('http').Server(app);
// let io = require('socket.io')(http);
let admin = require("firebase-admin");
let path = require('path');
let serveStatic = require('serve-static');
let serviceAccount = require("./account/wheeloffortune2-c0e4a-firebase-adminsdk-xx83k-e44ffb01f2.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://wheeloffortune2-c0e4a.firebaseio.com/"
});

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io')(server);

app.get('/', function (req, res) {
    res.send('<marquee><h1>Server is running</h1></marquee>');
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

function getGameData() {
    let db = admin.database();
    let ref = db.ref("game");
    let self = this;
    return ref.on("value", function (snapshot) {
        console.log('hallo');
        return snapshot.val();
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
}

function changeActivePlayer(currentPlayer, newPlayer) {
    admin.database().ref('game/players/player' + currentPlayer).update({
        active: false,
    });
    admin.database().ref('game/players/player' + newPlayer).update({
        active: true,
    });
}

function checkPlayers() {
    let players = []
    let finished;
    admin.database().ref('game/finished/end').once("value", function (snapshot) {
        finished = snapshot.val()
    })
    console.log(finished)
    admin.database().ref('game').on("value", function (snapshot) {
        let game = snapshot.val()
        for (let player of Object.values(game.players)) {
            if (player.playing) {
                players.push(player);
                console.log('players length: ',players.length);
                if (players.length === 3) {
                    console.log('Setting a new word')
                    console.log('players length in if: ', players.length)
                    setNewWord();
                }
            }
        }
    });
}

function resetAlphabeth() {
    admin.database().ref('game/alphabeth').update({
        A: true,
        B: false,
        C: false,
        D: false,
        E: true,
        F: false,
        G: false,
        H: false,
        I: true,
        J: false,
        K: false,
        L: false,
        M: false,
        N: false,
        O: true,
        P: false,
        Q: false,
        R: false,
        S: false,
        T: false,
        U: true,
        V: false,
        W: false,
        X: false,
        Y: false,
        Z: false,
    });
}

function setNewWord() {
    admin.database().ref('words/values').on("value", function (snapshot) {
        let words = snapshot.val();
        let randomNumber = Math.floor(Math.random() * words.length);
        let randomWordFromFirebase = words[randomNumber][0];
        let randomWordCategoryFromFirebase = words[randomNumber][1];

        admin.database().ref('game/answer/').update({
            word: randomWordFromFirebase,
            category: randomWordCategoryFromFirebase,
        });
    });
}
io.on('connection', function (socket) {
    console.log('someone connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    socket.on('turnChange', function (data) {
        console.log(data);
        let num = parseInt(data.number);
        if (num === 3) {
            num = 1;
            console.log(num);
            io.emit('turnChange', {
                'number': num
            })
            changeActivePlayer(data.number, num)
        } else {
            num++;
            console.log(num);
            io.emit('turnChange', {
                'number': num
            })
            changeActivePlayer(data.number, num)
        }
    });
    // socket.on('answer', function (data) {
    //     console.log(data);
    //     io.emit('answer', data)
    // });
    socket.on('startGame', function () {
        checkPlayers();
        resetAlphabeth();
    });

    socket.on('getScore', function () {
        io.emit('getScore');
    })
    socket.on('giveScore', function (data) {
        io.emit('giveScore', data);
        console.log(data)
    })
    socket.on('letMeWatch', function (data) {
        console.log('player ' + data.playerNum + ' wants to watch');
        io.emit('letMeWatch', data);
    })
    socket.on('startConnection', function (data) {
        console.log('host starts connection for player ' + data.playerNum);
        io.emit('startConnection', data);
    })
    socket.on('acceptConnection', function (data) {
        console.log('player ' + data.playerNum + ' accepts the connection');
        io.emit('acceptConnection', data);
    })
});