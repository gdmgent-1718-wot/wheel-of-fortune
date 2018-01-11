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
          <label for="displaynameid">Gebruikernaam</label>
          <input v-model="displayName" type="text" class="form-control" id="displaynameid" aria-describedby="emailHelp" placeholder="Uw gebruikersnaam">
          <label for="phoneid">Telefoonnummer</label>
          <input v-model="phoneNumber" type="tel" class="form-control" id="phoneid" placeholder="Telefoonnummer">
          <label for="emailid">Email</label>
          <input v-model="email" type="email" class="form-control" id="emailid" placeholder="Uw email">
          <button  v-on:click="updateUserData" type="submit" class="btn btn-primary">Update</button>
          <p>{{errorMessage}}</p>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
// Import dependencies.
import * as firebase from "firebase";
import { bus } from "../main";
import Router from "vue-router";
export default {
  name: "Completion",
  data() {
    return {
      msg: "Profielinfo",
      displayName: "",
      phoneNumber: "",
      imageURL:
        "http://hope4merton.com/wp-content/uploads/2015/12/profile-placeholder.gif",
      email: "",
      errorCode: "",
      errorMessage: "",
      user: ""
    };
  },
  methods: {
    // Get data from the user and get extra info.
    getUserData: function() {
      self = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          self.user = user;
          self.displayName = user.displayName;
          self.email = user.email;
          self.imageURL = user.photoURL;
        }
      });
    },

    // Update the user data bij adding email etc.
    updateUserData: function() {
      self = this;
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // Signed-in.
          user
            .updateProfile({
              displayName: self.displayName,
              photoURL: self.imageURL,
              email: self.email
            })
            .then(function() {
              // Update successful, push to Profile page.
              self.$router.push({ name: "Profile" });
            })
            .catch(function(error) {
              // Update not succesfull.
              self.errorMessage = error.message;
            });
        }
      });
    }
  },
  mounted: function() {
    self = this;
    self.getUserData();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed-in.
      } else {
        // User not signed-in, go to Login.
        self.$router.push({ name: "Login" });
      }
    });
  },
  created: function() {
    // Change menu items with bus event.
    bus.$emit("userLogin", true);
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
a {
  color: #42b983;
}
</style>
