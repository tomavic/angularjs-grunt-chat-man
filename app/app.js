"use strict";

/**
 * @ngdoc overview
 * @name angularfireSlackApp
 * @description
 * # angularfireSlackApp
 *
 * Main module of the application.
 */
angular
  .module("angularfireSlackApp", ["firebase", "angular-md5", "ui.router"])
  .config(function($stateProvider, $urlRouterProvider) {
    var config = {
      apiKey: "AIzaSyC4WQ8N6C5YOkqDRdPB2tnLVrf8lWlghFw",
      authDomain: "chat-man-1c2f8.firebaseapp.com",
      databaseURL: "https://chat-man-1c2f8.firebaseio.com",
      projectId: "chat-man-1c2f8",
      storageBucket: "chat-man-1c2f8.appspot.com",
      messagingSenderId: "731904783402",
      appId: "1:731904783402:web:8cb2b04fc80d84e9"
    };
    firebase.initializeApp(config);

    $stateProvider
      .state("home", {
        url: "/",
        templateUrl: "home/home.html",
        resolve: {
          requireNoAuth: function($state, Auth) {
            return Auth.$requireSignIn().then(
              function(auth) {
                $state.go("channels");
              },
              function(error) {
                return;
              }
            );
          }
        }
      })
      .state("login", {
        url: "/login",
        controller: "AuthCtrl as authCtrl",
        templateUrl: "auth/login.html",
        resolve: {
          requireNoAuth: function($state, Auth) {
            return Auth.$requireSignIn().then(
              function(auth) {
                $state.go("home");
              },
              function(error) {
                return;
              }
            );
          }
        }
      })
      .state("register", {
        url: "/register",
        controller: "AuthCtrl as authCtrl",
        templateUrl: "auth/register.html",
        resolve: {
          requireNoAuth: function($state, Auth) {
            return Auth.$requireSignIn().then(
              function(auth) {
                $state.go("home");
              },
              function(error) {
                return;
              }
            );
          }
        }
      })
      .state("channels.messages", {
        url: "/{channelId}/messages",
        templateUrl: "channels/messages.html",
        controller: "MessagesCtrl as messagesCtrl",
        resolve: {
          messages: function($stateParams, Messages) {
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function($stateParams, channels) {
            return "#" + channels.$getRecord($stateParams.channelId).name;
          }
        }
      })
      .state('channels.direct', {
        url: '/{uid}/messages/direct',
        templateUrl: 'channels/messages.html',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
          messages: function($stateParams, Messages, profile){
            return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
          },
          channelName: function($stateParams, Users){
            return Users.all.$loaded().then(function(){
              return '@'+Users.getDisplayName($stateParams.uid);
            });
          }
        }
      })
      .state("channels.create", {
        url: "/create",
        templateUrl: "channels/create.html",
        controller: "ChannelsCtrl as channelsCtrl"
      })
      .state("channels", {
        url: "/channels",
        controller: "ChannelsCtrl as channelsCtrl",
        templateUrl: "channels/index.html",
        resolve: {
          channels: function(Channels) {
            return Channels.$loaded();
          },
          profile: function($state, Auth, Users) {
            return Auth.$requireSignIn().then(
              function(auth) {
                return Users.getProfile(auth.uid)
                  .$loaded()
                  .then(function(profile) {
                    if (profile.displayName) {
                      return profile;
                    } else {
                      $state.go("profile");
                    }
                  });
              },
              function(error) {
                $state.go("home");
              }
            );
          }
        }
      })
      .state("profile", {
        url: "/profile",
        controller: "ProfileCtrl as profileCtrl",
        templateUrl: "users/profile.html",
        resolve: {
          auth: function($state, Users, Auth) {
            return Auth.$requireSignIn().catch(function() {
              $state.go("home");
            });
          },
          profile: function(Users, Auth) {
            return Auth.$requireSignIn().then(function(auth) {
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      });

    $urlRouterProvider.otherwise("/");
  })
  .constant("FirebaseUrl", "https://chat-man-1c2f8.firebaseio.com/");
