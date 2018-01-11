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
          <button v-on:click="register" type="submit">Registreer</button>
          <router-link :to="{ name: 'Login' }">Al een account? Log je nu in.</router-link>
          <p class="error">{{message}}</p>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
// Import dependencies.
import * as firebase from "firebase";
import vuesocket from "vue-socket.io";

export default {
  name: "Register",
  data() {
    return {
      msg: "Registreer",
      email: "",
      password: "",
      errorCode: "",
      message: ""
    };
  },
  methods: {
    // You can register. It will  create the account and sign-in the user to complete the profile.
    register: function() {
      self = this;
      firebase
        .auth()
        .createUserWithEmailAndPassword(self.email, self.password)
        .catch(function(error) {
          // Handle Errors here.
          self.errorCode = error.code;
          self.message = error.message;
          // Show errors in the console.
          console.log(error);
        })
        .then(function() {
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              // Give feedback when the user is registered succesfully.
              self.message = "De gebruiker is succesvol geregistreerd.";
              // Redirect the user so he can complete the registration and add more information.
              self.$router.push({ name: "Completion" });
            } else {
              // No user is signed in.
            }
          });
        });
    }
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
