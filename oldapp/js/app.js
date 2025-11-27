// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngStorage', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.simulate', {
    url: '/simulate',
    reload:true,
    views: {
      'tab-simulate': {
        templateUrl: 'templates/tab-simulate.html',
        controller: 'SimCtrl'
      }
    }
  })

  .state('tab.design', {
    url: '/design',
    views: {
      'tab-design': {
        templateUrl: 'templates/tab-design.html',
        controller: 'DesignCtrl'
      }
    }
  })

  .state('tab.design-detail', {
    url: '/design/:designId',
    views: {
      'tab-design': {
        templateUrl: 'templates/design-detail.html',
        controller: 'DesignDetailCtrl'
      }
    }
  })

  .state('tab.driver', {
    url: '/driver',
    views: {
      'tab-driver': {
        templateUrl: 'templates/tab-driver.html',
        controller: 'DriverCtrl'
      }
    }
  })
  .state('tab.driver-detail', {
    url: '/driver/:driverId',
    views: {
      'tab-driver': {
        templateUrl: 'templates/driver-detail.html',
        controller: 'DriverDetailCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/simulate');

});
