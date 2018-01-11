<template>
    <div>
        <header class="align-items container-fluid green-bg">
            <ul class='result pt-2 pl-0 small-container'>
                <li class="list-inline-item mr-1" v-for='letter in wordLetters'>
                    <h3 v-if="letter == ' ' " class="text-muted" style="opacity: 0.2">
                        {{ isGuessedLetter(letter) ? letter : '█'}}</h3>
                    <h3 v-else class="text-uppercase">{{ isGuessedLetter(letter) ? letter : '█'}}</h3>
                </li>
                <div v-if="alertMessage" class="alertbox">
                    <p>{{ alertMessage }}</p>
                    <button v-if="canDismissAlert" @click="dismissAlert">Ok</button>
                </div>
            </ul>
        </header>
        <main class="container-fluid">
            <div class="small-container pt-2" style="z-index: 10000">
                <p v-for="(value, key)  in scorePlayers"><span :id="key">Score Speler {{ key }}: {{ value }} </span></p>
                <p>Gedraaide score: {{ currentScore }} </p>
                <div v-if="currentPlayer != null && currentPlayer.active" class="playing">
                    <h3 class="pb-1 text-warning font-weight-bold">{{ randomWordCategory }}</h3>
                    <button v-if="begin == false" class="col-12 mb-2 green-bg" style="border: none;" @click="turnWheel">
                        Draai aan het rad!
                    </button>
                    <p v-if="turningMessage">Het rad is aan het draaien! De score dat je hebt gedraaid kan je hierboven aflezen in een klein half minuutje.</p>
                    <div v-if="showKeyboard">
                        <h4 v-if="message" class="font-weight-bold" :style="{ color: messageColor }">{{message}}</h4>
                        <button type="button" class="letter-button"
                                :disabled='single.checked || tries == 0 || showWord()'
                                @click='handleLetterClick(single)'
                                v-for='single in alphabet'>
                            {{ single.letter }}
                        </button>
                        <form class="pt-2">
                            <label for="sel1">Koop een klinker (voor 250 euro):</label>
                            <select class="form-control col-12 float-left mb-1 text-uppercase" id="sel1"
                                    v-model="vowel">
                                <option class="text-uppercase" v-for="klinker in vowels" :value="klinker.id">
                                    {{ klinker.letter }}
                                </option>
                            </select>
                            <button type="button" class="btn btn-primary btn col-12 mb-5 float-left"
                                    @click='unlockVowel'>
                                Koop klinker. (-€250)
                            </button>
                        </form>
                        <form class="pb-2">
                            <label>Mag ik het zeggen Walter (voor 250 euro)?</label>
                            <input type="text" class="col-12 form-control mb-1"
                                   placeholder="Het woord, de zin of gezegde is.."
                                   @keyup.enter="didIGuessRight" v-model="walterInput">
                            <button type="button" class="btn btn-primary btn col-12 mb-2 float-left"
                                    @click='didIGuessRight'>Ik ga het zeggen Walter! (-€250)
                            </button>
                            <span v-if='walterFeedback' class="font-weight-bold mb-3">{{ walterFeedback }}</span>
                        </form>
                    </div>
                </div>
                <div v-else=""><p>{{ statusMessage }}</p></div>
                <video class="col-12" id="videoStream"></video>
            </div>
        </main>
    </div>

</template>

<script>
    // Import dependencies.
    import Vue from "vue";
    import * as firebase from "firebase";
    import VueSocketio from "vue-socket.io";
    import {throwconfetti} from "../../static/js/confetti.js";
    import Peer from "simple-peer";
    import {bus} from "../main";

    Vue.use(VueSocketio, "http://localhost:5000/");
    // When online:
//    Vue.use(VueSocketio, 'https://wheeloffortune1718.herokuapp.com/');

    export default {
        name: "GameFinal",
        data() {
            return {
                showStream: false,
                peer: new Peer({trickle: false}),
                msg: "Game ",
                errorCode: "",
                errorMessage: "",
                database: firebase.database(),
                game: null,
                user: {},
                active: false,
                answer: "",
                players: [],
                currentPlayer: null,
                currentAnswer: null,
                showText: false,
                message: "",
                begin: false,
                messageColor: "red",
                loading: "Willekeurig een zin, woord of gezegde kiezen...",
                words: [],
                vowel: "",
                vowels: [
                    {
                        id: 0,
                        letter: "a"
                    },
                    {
                        id: 4,
                        letter: "e"
                    },
                    {
                        id: 8,
                        letter: "i"
                    },
                    {
                        id: 14,
                        letter: "o"
                    },
                    {
                        id: 20,
                        letter: "u"
                    }
                ],
                vowelsUsed: [],
                randomWord: "",
                randomWordCategory: "",
                compareWord: "",
                walterInput: "",
                walterFeedback: "",
                wordLetters: [],
                lettersUsed: [],
                tries: 6,
                initialTries: 6,
                alphabet: [],
                statusMessage:
                    "Het is momenteel aan een andere speler. Wacht uw beurt af.",
                scorePlayers: {
                    1: 0,
                    2: 0,
                    3: 0
                },
                currentScore: "...",
                isNegative: false,
                alertMessage: false,
                canDismissAlert: true,
                showKeyboard: false,
                turningMessage: false
            };
        },
        // Make a connection with Sockets, you can recieve triggers.
        sockets: {
            connect: function () {
                console.log("Socket succesfuly connected.");
            },
            customEmit: function (val) {
                console.log(
                    'This method was fired by the socket server. eg: io.emit("customEmit", data)'
                );
            }
        },

        methods: {
            initializeGame() {
                this.tries = this.initialTries;
                this.randomWord = "";
                this.randomWordCategory = "";
                this.compareWord = "";
                this.wordLetters = [];
                this.getWord();
                this.lockVowels();
                this.splitWordIntoLetters();
            },

            // Send a request to watch the stream.
            letMeWatch() {
                console.log("Request sent to watch the stream");
                console.log(this.currentPlayer.number);
                this.$socket.emit("letMeWatch", {playerNum: this.currentPlayer.number});
            },
            // Accept the request to watch the stream.
            acceptConnection(data) {
                console.log("Allow request to watch the stream");
                self = this;
                if (self.currentPlayer.number === data.playerNum) {
                    self.peer.signal(data.hostSignal);
                    self.peer.on("signal", function (signal) {
                        console.log("What is the livestream signal?");
                        console.log(signal);
                        self.$socket.emit("acceptConnection", {
                            playerNum: data.playerNum,
                            hostSignal: data.hostname,
                            peerIndex: data.peerIndex,
                            playerSignal: JSON.stringify(signal)
                        });
                    });
                    self.peer.on("stream", function (stream) {
                        console.log("stream? maybe? please?");
                        let video = document.querySelector("video");
                        video.src = window.URL.createObjectURL(stream);
                        video.play();
                    });
                }
            },
            // Turn the wheel en fill in the score that you just turned.
            turnWheel() {
                let self = this
                this.begin = true
                this.turningMessage = true
                self.database.ref("game/motor/").update({
                    turning: "True",
                    hasStopped: "False"
                });

                // Wait 10 seconds and then get the score from the server. (Server first has to take a picture)
                setTimeout(function () {
                    self.$socket.emit("getScore");
                }, 10000)

                // Wait 25 seconds until wheel has stopped to show the keyboard.
                setTimeout(function () {
                  self.showKeyboard = true
                  self.turningMessage = false
                }, 25000)
                // Here comes score from the camera.
                this.alertMessage = false;
            },

            // Assign a score to each player.
            assignScoreToPlayers() {
                let self = this;
                let database = firebase.database();
                let databaseRef = database.ref("game/players");

                databaseRef.on("value", function (snapshot) {
                    let playersInfo = snapshot.val();
                    self.scorePlayers[1] = playersInfo.player1.score;
                    self.scorePlayers[2] = playersInfo.player2.score;
                    self.scorePlayers[3] = playersInfo.player3.score;
                });
            },
            // Get a random word and category to guess.
            getWord() {
                this.randomWord = this.game.answer.word;
                this.randomWordCategory = "Categorie is: " + this.game.answer.category;
            },
            // Lock the vowel when beginning a game.
            lockVowels() {
                this.alphabet[0].checked = true;
                this.alphabet[4].checked = true;
                this.alphabet[8].checked = true;
                this.alphabet[14].checked = true;
                this.alphabet[20].checked = true;
            },
            // Unlock the vowel you just bought.
            unlockVowel() {
                // Substract €250 from his current score because he bought a vowel.
                this.substractMoneyFromCurrentMoney();
                // When the user has more then €250 the vowel will unlock.
                if (this.isNegative == false) this.alphabet[this.vowel].checked = false;
            },
            // Substract money from current score but check first if the player has enough money.
            substractMoneyFromCurrentMoney() {
                let currentPlayerScore = this.scorePlayers[this.currentPlayer.number];
                let substractedScore = currentPlayerScore - 250;
                // Check if the user has enough money?
                if (substractedScore < 0) {
                    // Not enough.
                    this.alertMessage =
                        "Je score is niet hoog genoeg om een klinker te kopen of het woord te raden.";
                    this.isNegative = true;
                } else {
                    // Enough.
                    this.isNegative = false;
                    // Update score in front-end.
                    this.scorePlayers[this.currentPlayer.number] = substractedScore;
                    // Update score in Firebase.
                    let database = firebase.database();
                    database.ref("game/players/player" + this.currentPlayer.number).update({
                        score: substractedScore
                    });
                }
            },

            // Get words from the database.
            getDataFromFirebase() {
                let self = this;
                let database = firebase.database();
                let databaseRef = database.ref("words");
                databaseRef.on("value", function (snapshot) {
                    // Push words to an array.
                    self.words = snapshot.val().values;
                    self.loading = "We zoeken een zin, woord of gezegde.";
                    self.initializeGame();
                });
            },

            // Split the word into letters and put those letters in an array.
            splitWordIntoLetters() {
                for (var i = 0; i < this.randomWord.length; i++) {
                    this.wordLetters.push(this.randomWord.toLowerCase().charAt(i));
                }
            },
            // What to do when you click a letter on the on-display keyboard.
            handleLetterClick(single) {
                single.checked = true;
                let letterFromAlpha = single.letter;

                // Lock it so other players can't use it.
                let database = firebase.database();
                database.ref("game/alphabeth/").update({
                    [letterFromAlpha]: true
                });

                // Make it visible in header when right.
                let letterClicked = single.letter.toLowerCase();
                this.lettersUsed.push(letterClicked);
                database.ref("game/lettersUsed").push(letterClicked);
                // Comare the word with all the letters to see if you won.
                this.compareWords();

                // Count how many times the letter was in the word, you will recieve this x times.
                this.countItemInArray(this.wordLetters, single.letter.toLowerCase());

                if (this.wordLetters.includes(single.letter.toLowerCase())) {
                    // Feedback when you guessed correct.
                    this.messageColor = "#4BE8D8";
                    this.message =
                        "Omdat je vorige letter goed hebt geraden mag je nu nog een letter kiezen.";
                    this.showKeyboard = false;
                    this.begin = false;
                } else {
                    // End your turn and go to next player.
                    this.endTurn();
                }
                this.checkIfWon();
            },

            // Count how many times the letter was in the word, you will recieve this x times.
            countItemInArray(array, value) {
                let n = 0;
                for (let i = 0; i < array.length; i++) {
                    if (array[i] == value) {
                        n++;
                    }
                }
                // You guessed wrong or you guessed correct.
                if (n == 0) {
                    this.alertMessage =
                        "Helaas, deze letter zoeken we niet. Het is aan de volgende.";
                } else {
                    this.alertMessage =
                        "Goed gedaan! Je zit op de juiste weg, je krijgt " +
                        n +
                        " keer het bedrag dat je hebt gedraaid en je mag nog eens draaien aan het rad.";
                    this.begin = false
                    this.showKeyboard = false
                }
                this.updateScore(n);
                return n;
            },

            // Update the score depening on how amount of times letter was in word.
            updateScore(times) {
                if (times != 0) {
                    let calculatedScore =
                        this.currentScore * times +
                        this.scorePlayers[this.currentPlayer.number];
                    // Push your new score to Firebase.
                    firebase
                        .database()
                        .ref("game/players/player" + this.currentPlayer.number)
                        .update({
                            score: calculatedScore
                        });
                    // Also update score on front-end.
                    this.scorePlayers[this.currentPlayer.number] = calculatedScore;
                }
                // Clear the score that was turned.
                this.currentScore = "...";
            },

            // Show the letters in header if they are in LettersUsed Array.
            isGuessedLetter(letter) {
                return this.lettersUsed.indexOf(letter.toLowerCase()) > -1;
            },

            // Add letters to compareWord so you can check if you won.
            compareWords() {
                this.compareWord = "";
                this.wordLetters.forEach(letter => {
                    if (this.lettersUsed.indexOf(letter) > -1) {
                        this.compareWord += letter;
                    }
                });
            },

            // Show the word when won.
            showWord() {
                return this.randomWord == this.compareWord;
            },

            // Event we will trigger to see if you have won.
            checkIfWon() {
                // Remove the spaces from word.
                let wordLettersNoSpaces;
                wordLettersNoSpaces = this.wordLetters.filter(function (str) {
                    return /\S/.test(str);
                });
                // You have won!
                if (this.compareWord.length == wordLettersNoSpaces.length) {
                    this.messageColor = "#00b84f";
                    this.message = "Proficiat! Je hebt gewonnen!!!.";
                    this.handleEndGame();
                }
            },

            // You can guess a word, check if this was right.
            didIGuessRight() {
                let self = this;
                let currentPlayerScore = this.scorePlayers[this.currentPlayer.number];
                // Make sure the score is high enough to guess a word.
                if (currentPlayerScore >= 250) {
                    if (
                        this.walterInput.replace(/\s/g, "").toLowerCase() != "" &&
                        this.walterInput.replace(/\s/g, "").toLowerCase() != null
                    ) {
                        if (
                            this.walterInput.replace(/\s/g, "").toLowerCase() ==
                            this.randomWord.replace(/\s/g, "").toLowerCase()
                        ) {
                            // You have won so the game is over.
                            this.handleEndGame();
                            this.walterFeedback = "Proficiat! U heeft het woord juist geraden!";
                        } else {
                            // You have guessed wrong and money will be taken away.
                            this.substractMoneyFromCurrentMoney();
                            this.walterFeedback =
                                "Helaas, u heeft het niet juist geraden. En de beurt gaat nu naar een andere speler.";
                            // Show this feedback for a while before leaving the page.
                            setTimeout(function () {
                                self.endTurn();
                            }, 2500);
                        }
                    } else this.walterFeedback = "U moet een woord invoeren..";
                } else {
                    // When the score is not high enough.
                    this.alertMessage =
                        "Helaas, je score is niet hoog genoeg om een woord te raden. Je moet minstens 250 hebben.";
                }
            },
            // When someone had won and the game will end.
            handleEndGame() {
                let self = this;
                // Throw confetti to celebrate.
                throwconfetti();
                clearTimeout(throwconfetti(), 5000);
                // All letters on lettersUsed so the word will appear in header.
                firebase
                    .database()
                    .ref("game/lettersUsed/")
                    .set({
                        0: "a",
                        1: "b",
                        2: "c",
                        3: "d",
                        4: "e",
                        5: "f",
                        6: "g",
                        7: "h",
                        8: "i",
                        9: "j",
                        10: "k",
                        11: "l",
                        12: "m",
                        13: "n",
                        14: "o",
                        15: "p",
                        16: "q",
                        17: "r",
                        18: "s",
                        19: "t",
                        20: "u",
                        21: "v",
                        22: "w",
                        23: "x",
                        24: "y",
                        25: "z"
                    });
                // Consider the game as finished so every player can see the game has ended and who won.
                firebase
                    .database()
                    .ref("game/finished/")
                    .update({
                        end: true,
                        winner: this.currentPlayer.name
                    });
                // Show who won and show confetti for 8 seconds, afterwards reset the game.
                setTimeout(function () {
                    document.getElementById("confettiCanvas").remove();
                    self.resetWholeGame();
                }, 8000);
            },

            // Reset the whole game and database so a new game can be played without errors.
            resetWholeGame() {
                firebase
                    .database()
                    .ref("game/players/")
                    .update({
                        player1: {
                            active: true,
                            host: 0,
                            id: 1,
                            identity: 0,
                            number: 1,
                            name: "",
                            playing: false,
                            score: 0,
                            stream: false
                        },
                        player2: {
                            active: false,
                            host: 0,
                            id: 2,
                            identity: 0,
                            number: 2,
                            name: "",
                            playing: false,
                            score: 0,
                            stream: false
                        },
                        player3: {
                            active: false,
                            host: 0,
                            id: 3,
                            identity: 0,
                            number: 3,
                            name: "",
                            playing: false,
                            score: 0,
                            stream: false
                        }
                    });
                firebase
                    .database()
                    .ref("game/lettersUsed/")
                    .remove();
                firebase
                    .database()
                    .ref("game/wasStopped/")
                    .set(false);
                // This emits a socket event that will select a new word and reset the alphabet (locked letters).
                this.$socket.emit("startGame");
                this.$router.push({name: "Profile"});
            },
            // Get data from the user.
            getUserData: function () {
                let self = this;
                firebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                        // Signed-in.
                        self.user = user;
                    }
                });
            },
            // Connect with sockets, you can recieve triggers en do things.
            getSocketData: function () {
                let self = this;
                self.$options.sockets.turnChange = data => {
                    console.log(data);
                };
                self.$options.sockets.answer = data => {
                    self.currentAnswer = data;
                };
                self.$options.sockets.userDisconnected = data => {
                    self.userDisconnectedAlert();
                };
                self.$options.sockets.startConnection = data => {
                    console.log(data);
                    self.acceptConnection(data);
                };
                self.$options.sockets.giveScore = data => {
                    console.log(data);
                    this.currentScore = data;
                };
            },

            // Give an alert when a user is disconnected.
            // We chose not to use this because it would trigger when refreshing a page.
            userDisconnectedAlert() {
                let self = this;
                this.canDismissAlert = false;
                this.alertMessage =
                    "Oeps! Een speler heeft het spel verlaten. Deze rond zal worden beëindigd.";
                setTimeout(function () {
                    self.$router.push({name: "Profile"});
                }, 5000);
            },
            // Detect if a user signs-out.
            authChange: function () {
                let self = this;
                firebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                    } else {
                        self.$router.push({name: "Login"});
                    }
                });
            },
            // Get data from the Firebase.
            getGameData: function () {
                let self = this;

                firebase
                    .database()
                    .ref("game")
                    .on("value", function (snapshot) {
                        self.game = snapshot.val();
                        // Get info from all players.
                        self.getPlayers(self.game.players);
                        // Get all letters to fill the on display keyboard.
                        self.checkArray();
                    });
            },

            // Change the message when a player has won the game.
            checkIfWonAndChangeMessage() {
                let self = this;
                let finishedStatus;
                let playerWon;
                // Get info who won.
                let finishedRef = firebase.database().ref("game/finished");
                finishedRef.on("value", function (snapshot) {
                    finishedStatus = snapshot.val().end;
                    playerWon = snapshot.val().winner;
                });
                // Show winner.
                if (finishedStatus == true) {
                    this.statusMessage = playerWon + " heeft het spel gewonnen!";
                    setTimeout(function () {
                        self.$router.push({name: "Profile"});
                    }, 5000);
                }
            },
            // Handle what letters were used, which vowels can't be bought...
            handleLettersAndVowelsUsed() {
                let self = this;
                firebase
                    .database()
                    .ref("game/lettersUsed")
                    .on("value", function (snapshot) {
                        let lettersFromDatabase = snapshot.val();
                        if (lettersFromDatabase != null && lettersFromDatabase.length != 0) {
                            // Get the letters used by all players.
                            self.lettersUsed = Object.values(lettersFromDatabase);
                            // Get the vowels from these letters.
                            // If a vowel is already used it will be removed from list to buy.
                            self.vowelsUsed = self.lettersUsed.filter(function (obj) {
                                return (
                                    obj == "a" ||
                                    obj == "e" ||
                                    obj == "i" ||
                                    obj == "o" ||
                                    obj == "u"
                                );
                            });
                        } else {
                            self.lettersUsed = [];
                        }
                        // Filter the used vowels out the list.
                        for (let i = 0; i < self.vowelsUsed.length; i++) {
                            self.vowels = self.vowels.filter(function (obj) {
                                return obj.letter != self.vowelsUsed[i];
                            });
                        }
                    });
            },
            // Fill the keyboard with letters.
            checkArray: function () {
                this.alphabet = [];
                let values = Object.values(this.game.alphabeth);
                let keys = Object.keys(this.game.alphabeth);
                if (values.length === keys.length) {
                    for (let i = 0; i < values.length; i++) {
                        this.alphabet.push({letter: keys[i], checked: values[i]});
                    }
                }
            },
            // Get info from players.
            getPlayers: function (players) {
                let self = this;
                self.players = [];
                self.currentPlayer = [];
                // Check for each player...
                for (let player of Object.values(players)) {
                    if (player.id === self.user.uid) {
                        self.currentPlayer = player;
                        self.players.push(player);
                        // Change your account name in orange.
                        let test = document.getElementById(self.currentPlayer.number);
                        test.classList.add("orange");
                    } else {
                        if (player.playing) {
                            self.players.push(player);
                        }
                    }
                }
            },
            // End the turn.
            endTurn: function () {
                this.$socket.emit("turnChange", {number: this.currentPlayer.number});
            },

            // When there is a change in the finished table it will check if the game is done.
            whenGameFinishedDatabaseChangeIsMade() {
                let self = this;
                firebase
                    .database()
                    .ref("game/finished")
                    .on("value", function (snapshot) {
                        self.checkIfWonAndChangeMessage();
                    });
            },

            // You can stop a game in the menu. This wil end the game for all and bring you back to home.
            checkIfGameWasStopped() {
                let self = this;
                firebase
                    .database()
                    .ref("game/wasStopped")
                    .on("value", function (snapshot) {
                        if (snapshot.val() == true) self.resetWholeGame();
                    });
            },

            // Press OK to dismiss the alert.
            dismissAlert() {
                this.alertMessage = false;
            },

            // Warning before refresh.
            // We chose not to use this because it is unclear.
            warnBeforeRefresh() {
                window.onbeforeunload = function () {
                    return "Als je de pagina herlaadt zal het spel beëindigen! Weet je het zeker?";
                };
            }
        },

        created() {
            bus.$emit("userLogin", true);
            this.authChange();
            this.handleLettersAndVowelsUsed();
            this.getUserData();
            this.getGameData();
            //            this.getSocketData();
            this.getDataFromFirebase();
            this.whenGameFinishedDatabaseChangeIsMade();
            this.checkIfGameWasStopped();
            this.assignScoreToPlayers();
        },

        mounted() {
            this.authChange();
            this.getUserData();
            this.getSocketData();
            this.getDataFromFirebase();
            // this.handleLettersAndVowelsUsed();
            let self = this;
            setTimeout(function () {
                self.letMeWatch();
            }, 3000)

        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1,
    h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }
</style>
