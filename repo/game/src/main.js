// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import * as firebase from "firebase";
// import VueSocketio from 'vue-socket.io';

require('../static/css/main.css');
require('../static/js/menu.js');
require('../static/js/confetti.js');

var config = {
    apiKey: "AIzaSyCRDbOBN_g2rlAqy8NBSRmjfvrPMswf4EE",
    authDomain: "wheeloffyaortune2-c0e4a.firebaseapp.com",
    databaseURL: "https://wheeloffortune2-c0e4a.firebaseio.com/",
    storageBucket: "gs://wheeloffortune2-c0e4a.appspot.com/",
};

export const bus = new Vue();

firebase.initializeApp(config);
Vue.config.productionTip = false
// window.jQuery = window.$ = require('../node_modules/jquery/dist/jquery.js');
// // require('https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js');
// //
// // require('../node_modules/bootstrap/dist/css/bootstrap.css');
// // require('../node_modules/bootstrap/dist/js/bootstrap.js');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})


