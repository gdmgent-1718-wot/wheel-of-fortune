<template>
    <div class="parent">
      <div id="myNav" class="overlay">
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
        <div class="overlay-content">
          <h3 v-if="loggedIn == false"><router-link onclick="closeNav()" class="nav-item nav-link active" to="/">Login</router-link></h3>
          <h3  v-if="loggedIn"><router-link onclick="closeNav()" to="profile" class="nav-item nav-link">Home</router-link></h3>
          <h3  v-if="admin"><router-link onclick="closeNav()" to="admin" class="nav-item nav-link">Admin</router-link></h3>
          <h3 v-if="loggedIn" @click="logout"><router-link class="nav-item nav-link active" to="/">Logout</router-link></h3>
          <h3 v-if="loggedIn" @click="stopGame"><router-link onclick="closeNav()" class="nav-item nav-link active" to="profile">Stop het spel</router-link></h3>
        </div>
      </div>
      <nav class="container-fluid red-bg">
        <img src="../static/img/logo.png" class="logo">
        <img src="../static/img/menu.png" class="menu-icon" onclick="openNav()">
      </nav>
        <div id="app">
            <router-view/>
        </div>
    </div>
</template>

<script>
  import { bus } from './main';
  import * as firebase from "firebase";

export default {
  name: 'app',
  data () {
    return {
      user: firebase.auth().currentUser,
      loggedIn: false,
      admin: false
    }
  },
  created () {
    let self = this
    bus.$on('userLogin', () => {
      self.checkIfOnline();
    })
  },
  methods: {
    checkIfOnline (){
      let self = this
      firebase.auth().onAuthStateChanged(function (user) {
        if(user != undefined){
          self.loggedIn = true
              if (user.email == 'player1@test.be') {
                self.admin = true
              }
              else
                self.admin = false
        }
        else {
          self.loggedIn = false
        }
      }
      )},
    stopGame () {
      firebase.database().ref('game/wasStopped/').set(true)
    },
    logout () {
      closeNav()
      let self = this
      firebase.auth().signOut().then(function () {
        // Sign-out successful.
        self.loggedIn = false
        self.admin = false
        self.$router.push('/');
      }, function (error) {
        // An error happened.
      });
    }
    }
  }
</script>
