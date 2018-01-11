<template>
  <div>
    <header class="align-items container-fluid red-bg">
      <div class="align-center">
        <h1>{{ msg }}</h1>
      </div>
    </header>
    <main class="container-fluid">
      <div class="small-container pt-5">
        <form class="col-12">
          <label for="emailid">Email</label>
          <input v-model="email" class="col-10" type="text"  id="emailid" aria-describedby="emailHelp" placeholder="janmodaal@test.be">
          <label for="passwordid">Wachtwoord</label>
          <input v-model="password" id="passwordid" placeholder="Password" class="col-10" type="password">
          <button v-on:click="login" type="button">Log in</button>
          <router-link :to="{ name: 'Register' }">Nog geen account? Registreer nu.</router-link>
          <p class="error">{{ errorMessage }}</p>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
// Import dependencies.
import * as firebase from "firebase";
import Router from "vue-router";
import vuesocket from "vue-socket.io";
import { bus } from "../main";

export default {
  name: "Login",
  data() {
    return {
      msg: "Login",
      email: "",
      password: "",
      errorCode: "",
      errorMessage: "",
      user: firebase.auth().currentUser
    };
  },
  methods: {
    // This method will sign-in the user.
    login: function() {
      let self = this;
      firebase
        .auth()
        .signInWithEmailAndPassword(self.email, self.password)
        .catch(function(error) {
          // Handle Errors here.
          self.errorCode = error.code;
          self.errorMessage = error.message;
        })
        .then(function() {
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              // User is signed-in, go to profile and emit bus event to change menu items.
              bus.$emit("userLogin", true);
              self.$router.push("profile");
            } else {
              // No user is signed in.
            }
          });
        });
    }
  },
  created: function() {
    // Check if the user is already signed-in, change menu items and go to Profile.
    if (this.user) {
      bus.$emit("userLogin", true);
      self.$router.push("profile");
    }
  }
};
</script>
