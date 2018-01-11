<template>
    <div>
        <video autoplay></video>
        <br>
        <canvas id="video"></canvas>
        <canvas style="position: absolute" id="overlay"></canvas>
        <div>
            <p>{{ rgb }}</p>
            <p v-if="color">De kleur dat ik zie is: {{ color }}</p>
            <p v-if="score">De speler maakt kans om {{ score }} euro te winnen.</p>
            <label title="X position">X position</label>
            <input type="range" min="0" max="640" @change="setPixel" name="X position" v-model="x"/>
            <label title="Y position">Y position</label>
            <input type="range" min="0" max="480" @change="setPixel" name="Y position" v-model="y"/>
            <label title="black">Black</label>
            <input type="number" name="black-r" v-model="colors.black.r"/>
            <input type="number" name="black-g" v-model="colors.black.g"/>
            <input type="number" name="black-b" v-model="colors.black.b"/>
            <button type="button" @click="setBlack">Set black</button>
            <label title="orange">Orange</label>
            <input type="number" name="orange-r" v-model="colors.orange.r"/>
            <input type="number" name="orange-g" v-model="colors.orange.g"/>
            <input type="number" name="orange-b" v-model="colors.orange.b"/>
            <button type="button" @click="setOrange">Set orange</button>
            <label title="magenta">Magenta</label>
            <input type="number" name="magenta-r" v-model="colors.magenta.r"/>
            <input type="number" name="magenta-g" v-model="colors.magenta.g"/>
            <input type="number" name="magenta-b" v-model="colors.magenta.b"/>
            <button type="button" @click="setMagenta">Set magenta</button>
            <label title="red">Red</label>
            <input type="number" name="red-r" v-model="colors.red.r"/>
            <input type="number" name="red-g" v-model="colors.red.g"/>
            <input type="number" name="red-b" v-model="colors.red.b"/>
            <button type="button" @click="setRed">Set red</button>
            <label title="cyan">Cyan</label>
            <input type="number" name="cyan-r" v-model="colors.cyan.r"/>
            <input type="number" name="cyan-g" v-model="colors.cyan.g"/>
            <input type="number" name="cyan-b" v-model="colors.cyan.b"/>
            <button type="button" @click="setCyan">Set cyan</button>
            <label title="green">Green</label>
            <input type="number" name="green-r" v-model="colors.green.r"/>
            <input type="number" name="green-g" v-model="colors.green.g"/>
            <input type="number" name="green-b" v-model="colors.green.b"/>
            <button type="button" @click="setGreen">Set green</button>
            <label title="yellow">Yellow</label>
            <input type="number" name="yellow-r" v-model="colors.yellow.r"/>
            <input type="number" name="yellow-g" v-model="colors.yellow.g"/>
            <input type="number" name="yellow-b" v-model="colors.yellow.b"/>
            <button type="button" @click="setYellow">Set yellow</button>
            <label title="blue">Blue</label>
            <input type="number" name="blue-r" v-model="colors.blue.r"/>
            <input type="number" name="blue-g" v-model="colors.blue.g"/>
            <input type="number" name="blue-b" v-model="colors.blue.b"/>
            <button type="button" @click="setBlue">Set Blue</button>
        </div>
    </div>
</template>

<script>
    // Import dependencies.
    import Vue from "vue";
    import * as firebase from "firebase";
    import Peer from "simple-peer";
    import VueSocketio from "vue-socket.io";

    Vue.use(VueSocketio, "http://localhost:5000/");
    //    // When building:
//         Vue.use(VueSocketio, 'https://wheeloffortune1718.herokuapp.com/');

    export default {
        name: "Camera",
        data() {
            return {
                video: null,
                constraints: {audio: false, video: true},
                database: firebase.database(),
                parameters: {
                    trickle: false,
                    initiator: true,
                    stream: null
                },
                peers: [],
                firebaseObject: null,
                players: null,
                canvas: null,
                overlay: null,
                ctx: null,
                octx: null,
                x: 100,
                y: 100,
                videoWidth: null,
                videoHeight: null,
                rgb: [],
                rgbFormatted: "",
                color: '',
                differences: [],
                score: '',
                differecesColors: [],
                colors: {
                    black: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    orange: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    magenta: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    red: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    cyan: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    green: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    yellow: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                    blue: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                }
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
            setBlack: function () {
                this.getPixelColor();
                this.colors.black.r = this.rgb[0];
                this.colors.black.g = this.rgb[1]
                this.colors.black.b = this.rgb[2]
            },
            setOrange: function () {
                this.getPixelColor();
                this.colors.orange.r = this.rgb[0];
                this.colors.orange.g = this.rgb[1]
                this.colors.orange.b = this.rgb[2]
            },
            setMagenta: function () {
                this.getPixelColor();
                this.colors.magenta.r = this.rgb[0];
                this.colors.magenta.g = this.rgb[1]
                this.colors.magenta.b = this.rgb[2]
            },
            setRed: function () {
                this.getPixelColor();
                this.colors.red.r = this.rgb[0];
                this.colors.red.g = this.rgb[1]
                this.colors.red.b = this.rgb[2]
            },
            setCyan: function () {
                this.getPixelColor();
                this.colors.cyan.r = this.rgb[0];
                this.colors.cyan.g = this.rgb[1]
                this.colors.cyan.b = this.rgb[2]
            },
            setGreen: function () {
                this.getPixelColor();
                this.colors.green.r = this.rgb[0];
                this.colors.green.g = this.rgb[1]
                this.colors.green.b = this.rgb[2]
            },
            setYellow: function () {
                this.getPixelColor();
                this.colors.yellow.r = this.rgb[0];
                this.colors.yellow.g = this.rgb[1]
                this.colors.yellow.b = this.rgb[2]
            },
            setBlue: function () {
                this.getPixelColor();
                this.colors.blue.r = this.rgb[0];
                this.colors.blue.g = this.rgb[1]
                this.colors.blue.b = this.rgb[2]
            },

            // Connect with sockets to recieve data.
            getSockets: function () {
                let self = this;
                self.$options.sockets.newRecievePeer = data => {
                    // Get peer info.
                    console.log(self.peers[data.number - 1]);
                    self.peers[data.number - 1].signal(data.identity);
                };
                self.$options.sockets.letMeWatch = data => {
                    // Recieve connection requests to livestream.
                    console.log("Some requests to watch Wheel of Fortune.");
                    self.newPlayerStream(data);
                };
                self.$options.sockets.acceptConnection = data => {
                    // Allow connection requests to livestream.
                    console.log("Allow the request so they can watch Wheel of Fortune.");
                    console.log(self.parameters);
                    //                    self.startStream(data);
                    self.peers[data.peerIndex].signal(data.playerSignal);
                    //                    self.$socket.emit('startStream', data);
                };

                // Ask the color
                self.$options.sockets.getScore = data => {
                    // Get the score.
//                    self.getPixelColor();
                    self.database.ref("game/motor/").update({
                        turning: "False",
                    });
                    setTimeout(function () {
                        self.getPixelColor();
                        console.log("wheel should have stopped");
                    }, 15000)
                };
            },
            // New stream openened for a player.
            newPlayerStream(data) {
                let self = this;
                let peer = new Peer(self.parameters);
                self.peers.push(peer);
                let index = 0;
                if (self.peers.length >= 1) {
                    index = self.peers.length - 1;
                }
                console.log(self.peers);
                peer.on("signal", function (signal) {
                    console.log(signal);
                    self.$socket.emit("startConnection", {
                        playerNum: data.playerNum,
                        hostSignal: JSON.stringify(signal),
                        peerIndex: index
                    });
                });
            },
            // Start the stream.
            startStream(data) {
            },
            // Draw an overlay on top of canvas. Not being used.
            // initializeOverlay: function() {},

            // Make a canvas.
            initializeCanvas: function () {
                let self = this;
                // Make a canvas where the video will be shown.
                let canvas = document.querySelector("canvas");
                let overlay = document.getElementById("overlay");
                // Canvascontext.
                self.ctx = canvas.getContext("2d");
                // Overlay context.
                self.octx = overlay.getContext("2d");
                let video = self.video;
                // Let the video play.
                video.addEventListener(
                    "play",
                    function () {
                        self.videoHeight = this.videoHeight;
                        self.videoWidth = this.videoWidth;
                        canvas.width = self.videoWidth;
                        canvas.height = self.videoHeight;
                        overlay.width = self.videoWidth;
                        overlay.height = self.videoHeight;
                        overlay.style.position = "absolute";
                        overlay.style.left = 0;
                        //                    video.style.display = "none";
                        self.canvas = canvas;
                        self.overlay = overlay;
                        let $this = this; //cache

                        (function loop() {
                            if (!$this.paused && !$this.ended) {
                                self.ctx.drawImage($this, 0, 0);
                                setTimeout(loop, 1000 / 30); // drawing at 30fps
                            }
                        })();
                        self.getPixelColor();
                        self.setPixel();
                    },
                    0
                );
            },
            getPixelColor: function () {
                let self = this;
                // Get info from the Canvascontext.
                let pixel = self.ctx.getImageData(self.x, self.y, 1, 1);
                // This info will be a Uint8ClampedArray representing RGBA but everything will be between 0-255.
                let pixeldata = pixel.data;
                // Write RGB values to array.
                self.rgb = [pixeldata[0], pixeldata[1], pixeldata[2]];
                // Convert the pixel data to RBGa object.
                self.rgbFormatted =
                    "rgb(" + pixeldata[0] + ", " + pixeldata[1] + ", " + pixeldata[2] + ")";

                // Check the color and assign a score.
                self.checkWhichColorWithRange(pixeldata[0], pixeldata[1], pixeldata[2]);

                // Give score to server.
//                self.$socket.emit("giveScore", self.score);
            },
            // Place red pixel on overlay where you want, will set x and y coordinates.
            setPixel: function () {
                let self = this;
                self.octx.clearRect(0, 0, self.videoWidth, self.videoHeight);

                self.octx.fillStyle = "rgba(0, 0, 0, 0.75)";
                self.octx.fillRect(0, 0, self.videoWidth, self.videoHeight);
                self.octx.fillStyle = "#f00";
                self.octx.fillRect(self.x, self.y, 5, 5);
                self.getPixelColor();
                console.log("setting pixel");
                let databaseRef = self.database.ref("colorPos");

                databaseRef.update({
                    x: self.x,
                    y: self.y,
                });
            },
            //
            getVideo: function () {
                let self = this;
                navigator.getUserMedia =
                    navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia;
                self.video = document.querySelector("video");

                navigator.getUserMedia(
                    this.constraints,
                    function (stream) {
                        self.video.src = window.URL.createObjectURL(stream);
                        self.parameters.stream = stream;
                        self.initializeCanvas();
                    },
                    function (error) {
                        console.log("getUserMedia error: ", error);
                    }
                );
            },
            // Check the range of the color detected, if it is between .. and .. it corresponds to Score ...
            checkWhichColorWithRange(pixelRed, pixelGreen, pixelBlue) {
                let self = this;
                let index = 0;
                self.differences = []
                self.differecesColors = []
                Object.keys(this.colors).forEach(function (key) {
                    self.colorDistance(self.colors[key].r, self.colors[key].g, self.colors[key].b, pixelRed, pixelGreen, pixelBlue, key);
                    index++;
                    console.log(index);
                    console.log(Object.keys(self.colors).length)

                    if (index === Object.keys(self.colors).length) {
                        console.log('gedaan');
                        console.log(self.differences);
                        console.log(self.differecesColors);
                        console.log(self.differecesColors[self.differences.indexOf(Math.min.apply(null, self.differences))]);
                        switch (self.differecesColors[self.differences.indexOf(Math.min.apply(null, self.differences))]) {
                            case 'black': {
                                self.$socket.emit("giveScore", 0);
                            }break;
                            case 'orange': {
                                self.$socket.emit("giveScore", 250);
                            }break;
                            case 'magenta': {
                                self.$socket.emit("giveScore", 25);
                            }break;
                            case 'red': {
                                self.$socket.emit("giveScore", 50);
                            }break;
                            case 'cyan': {
                                self.$socket.emit("giveScore", 100);
                            }break;
                            case 'green': {
                                self.$socket.emit("giveScore", 50);
                            }break;
                            case 'yellow': {
                                self.$socket.emit("giveScore", 150);
                            }break;
                            case 'blue': {
                                self.$socket.emit("giveScore", 50);
                            }break;

                        }
                    }
                });
//                // Check of het blauw is?
//                if (this.colorDistance(this.colors.cyan.r, this.colors.cyan.g, this.colors.cyan.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'blauw!'
//                    this.score = 100
//                }
//                if (this.colorDistance(this.colors.green.r, this.colors.green.g, this.colors.green.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'groen!'
//                    this.score = 50
//                }
//                if (this.colorDistance(this.colors.yellow.r, this.colors.yellow.g, this.colors.yellow.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'geel!'
//                    this.score = 150
//                }
//                if (this.colorDistance(this.colors.black.r, this.colors.black.g, this.colors.black.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'zwart!'
//                    this.score = 0
//                }
//                if (this.colorDistance(this.colors.blue.r, this.colors.blue.g, this.colors.blue.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'paars!'
//                    this.score = 50
//                }
//                if (this.colorDistance(this.colors.blue.r, this.colors.blue.g, this.colors.blue.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'paars!'
//                    this.score = 50
//                }
//
//                if (this.colorDistance(this.colors.red.r, this.colors.red.g, this.colors.red.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'rood!'
//                    this.score = 50
//                }
//                if (this.colorDistance(this.colors.orange.r, this.colors.orange.g, this.colors.orange.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'oranje!'
//                    this.score = 250
//                }
//                if (this.colorDistance(this.colors.magenta.r, this.colors.magenta.g, this.colors.magenta.b, pixelRed, pixelGreen, pixelBlue) == true) {
//                    this.color = 'roze!'
//                    this.score = 25
//                }
            },

            colorDistance(colorRed, colorGreen, colorBlue, pixelRed, pixelGreen, pixelBlue, key) {
                let diffR, diffG, diffB;
                let self = this;

                // distance to color
                diffR = colorRed - pixelRed;
                diffG = colorGreen - pixelGreen;
                diffB = colorBlue - pixelBlue;

                let difference = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

                self.differences.push(difference);
                self.differecesColors.push(key)
            },
            getColorPos: function () {
                self = this;
                console.log('getposition');
                let databaseRef = self.database.ref("colorPos");

                databaseRef.on("value", function (snapshot) {
                    let pos = snapshot.val();
                    console.log('change')
                    self.x = pos.x;
                    self.y = pos.y;
                    self.setPixel();
                });
            }
        },
        mounted() {
            this.getVideo();
            this.getSockets();
            this.getColorPos();
        }
    };
</script>
