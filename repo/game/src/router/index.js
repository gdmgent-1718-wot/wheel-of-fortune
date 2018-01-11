import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Register from '@/components/Register'
import Completion from '@/components/Completion'
import Profile from '@/components/Profile'
import Lobby from '@/components/Lobby'
import GameFinal from '@/components/GameFinal'
import Admin from '@/components/Admin'
import Camera from '@/components/Camera'

Vue.use(Router)
import * as firebase from "firebase";

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Login',
            component: Login,
        },
        {
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/completion',
            name: 'Completion',
            component: Completion
        },
        {
            path: '/profile',
            name: 'Profile',
            component: Profile
        },
        {
            path: '/lobby',
            name: 'Lobby',
            component: Lobby,
        },
        {
            path: '/game',
            name: 'GameFinal',
            component: GameFinal,
            props: { default: true },
        },
        {
            path: '/admin',
            name: 'Admin',
            component: Admin,
          beforeEnter: (to, from, next) => {
            firebase.auth().onAuthStateChanged(function (user) {
              if(user != undefined){
                if (user.email == 'player1@test.be') {
                  next()
                } else {
                  to: Login
                }
              }
              else {
                to: Login
              }
            });
          }
        },
        {
            path: '/admin/camera',
            name: 'Camera',
            component: Camera,
          beforeEnter: (to, from, next) => {
            firebase.auth().onAuthStateChanged(function (user) {
              if(user != undefined){
                if (user.email == 'player1@test.be') {
                  next()
                } else {
                  to: Login
                }
              }
              else {
                to: Login
              }
            });
          }
        }
    ]
})
