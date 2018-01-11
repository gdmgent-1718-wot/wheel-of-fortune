<template>
  <div>
    <header class="align-items container-fluid red-bg">
      <div class="align-center">
        <h1>{{ msg }}</h1>
      </div>
    </header>
    <main class="container-fluid">
      <div class="small-container pt-2">
        <p>
          Raad een letter uit een zin, woord of gezegde, als u het juist heeft mag u nog eens draaien aan het rad én mag u nogmaals een letter raden.  
          Indien je fout hebt geraden is het aan de andere speler. 
          Klinkers kan u kopen voor €250, als je denkt het woord te weten mag je dit raden maar als je het fout hebt betaal je ook €250.
        </p>

        <router-link class="mb-2 link-as-button" :to="{ name: 'Lobby' }">Voeg je toe aan de wachtrij en speel het spel.</router-link>
        <a href="#" v-on:click="logout">Uitloggen</a>
      </div>
    </main>
  </div>
</template>

<script>
// Import dependencies.
import * as firebase from "firebase";
import Router from "vue-router";
import { bus } from "../main";

export default {
  name: "Profiel",
  data() {
    return {
      msg: "Welkom ",
      displayName: "",
      password: "",
      errorCode: "",
      errorMessage: "",
      user: firebase.auth().currentUser
    };
  },
  methods: {
    // Check if the user is signed-in and write his name in the header.
    getUserData: function() {
      let self = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed-in.
          self.displayName = user.displayName;
          // Add the user his name on top of page in the header.
          self.msg = "Welkom " + self.displayName;
        } else {
          // User is signed-out.
        }
      });
    },
    // Sign-out the user.
    logout: function() {
      let self = this;
      firebase
        .auth()
        .signOut()
        .then(
          function() {
            // Sign-out successful.
            self.$router.push({ name: "Login" });
          },
          function(error) {
            // An error happened.
          }
        );
    }
  },
  mounted: function() {
    // Make sure there is no confetti left on the profile page from the previous round.
    if (document.getElementById("confettiCanvas") != null)
      document.getElementById("confettiCanvas").remove();

    let self = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed-in and can visit this page. Edit the menu items.
        self.getUserData();
        bus.$emit("userLogin", true);
      } else {
        // User appears to be signed-out, you will be redirected to the Lobby.
        self.$router.push({ name: "Lobby" });
      }
    });
  }
};
</script>
