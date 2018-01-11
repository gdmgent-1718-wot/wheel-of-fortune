<template>
  <div>
    <header class="align-items container-fluid red-bg">
      <div class="align-center">
        <h1>{{ msg }}</h1>
      </div>
    </header>
    <main class="container-fluid">
      <div class="small-container pt-2">
        <div class="spots inline-block" v-if="spots && !playing">
          <h2 class="pb-1">Beschikbare plaatsen:</h2>
          <div v-for="(spot, index) in spots" class="card mb-1 col-4">
            <h3 class="">Speler {{ spot.number }}</h3>
            <button class="btn btn-info" v-on:click="claimSpot(spot.number)">Eis plaats op</button>
          </div>
        </div>
        <div v-if="occupied" class="occupied pt-3 inline-block">
          <hr>
          <p class="text-info" v-if="occupied && playing" >The game will start soon waiting for {{ spots.length }} more players</p>
          <h2 v-if="occupied" class="pb-1">Huidige spelers aan het wachten:</h2>
          <div v-for="player in occupied" class="card">
            <h3 class="pb-1 pt-2">{{ player.name }}</h3>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
// Import dependencies.
import * as firebase from "firebase";
import { bus } from "../main";
import vuesocket from "vue-socket.io";

export default {
  name: "Lobby",
  data() {
    return {
      msg: "Lobby ",
      errorCode: "",
      errorMessage: "",
      game: null,
      user: {},
      playing: false,
      answer: "",
      spots: [],
      occupied: []
    };
  },
  methods: {
    // Get data from the user.
    getUserData: function() {
      let self = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // Add firebase data to Vue Component's data.
          self.user = user;
        }
      });
    },
    // Detect if the user has signed-out.
    authChange: function() {
      let self = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is still signed-in.
        } else {
          // User signed-out, redirect to Login page.
          self.$router.push({ name: "Login" });
        }
      });
    },
    // Get data from the 'game' column in Firebase.
    getGameData: function() {
      let self = this;
      firebase
        .database()
        .ref("game/players")
        .on("value", function(snapshot) {
          // Make a snapshot of this data.
          self.game = snapshot.val();
          // Check which spots are available.
          self.checkSpot();
        });
    },
    // Will be fired once at the beginning and when a spot is claimed.
    // Check if spots are available, act accordingly.
    checkSpot: function() {
      let self = this;
      self.spots = [];
      self.occupied = [];
      for (let player of Object.values(self.game)) {
        // Do this for every player on their own screen. (Or if already claimed a spot)
        if (player.id === self.user.uid) {
          // You will be considered as 'playing', this means you have succesfully claimed a spot.
          self.playing = true;
          self.occupied.push(player);
          // When there are 3 people who have claimed a spot begin the game and reset the 'finished' column in the Firebase.
          if (self.occupied.length === 3) {
            firebase
              .database()
              .ref("game/finished/")
              .update({
                end: false,
                winner: "test"
              });
            //Start the game, go to the game page.
            self.$router.push({ name: "GameFinal" });
          }
        } else {
          // Do this for every player except yourself. (Or if you haven't claimed a spot)
          if (!player.playing) {
            // If you haven't claimed a spot, claim one!
            self.spots.push(player);
          } else {
            self.occupied.push(player);
            // When there are 3 people who have claimed a spot begin the game and reset the 'finished' column in the Firebase.
            if (self.occupied.length === 3) {
              firebase
                .database()
                .ref("game/finished/")
                .update({
                  end: false,
                  winner: "test"
                });
              self.$router.push({ name: "GameFinal" });
            }
          }
        }
      }
    },

    // Let the firebase know that you have claimed a spot.
    claimSpot: function(number) {
      let self = this;
      let selector = "player" + number;
      firebase
        .database()
        .ref("game/players/" + selector)
        .update({
          id: self.user.uid,
          name: self.user.displayName,
          playing: true
        });
      // Now change the front-end by running this method.
      self.checkSpot();
    }
  },
  created() {
    // Make sure there is no confetti left on the lobby page from the previous round.
    if (document.getElementById("confettiCanvas") != null)
      document.getElementById("confettiCanvas").remove();
    bus.$emit("userLogin", true);
    this.authChange();
    this.getUserData();
    this.getGameData();
  },
  mounted: function() {
    // Make sure there is no confetti left on the lobby page from the previous round.
    if (document.getElementById("confettiCanvas") != null)
      document.getElementById("confettiCanvas").remove();
    bus.$emit("userLogin", true);
    this.authChange();
    this.getUserData();
    this.getGameData();
  }
};
</script>
