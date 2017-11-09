var app = angular.module("myApp", ['ngRoute', 'ngResource', 'angularMoment']);

app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        
        $routeProvider
            .when('/', {
                templateUrl: 'app/views/home.html',
                controller: "homeCtrl",
                resolve: {
                    userList : function(userFactory){
                        return userFactory.query();
                    },
                    deviceList : function(deviceFactory){
                        return deviceFactory.query();
                    }
                }
            })
            .when("/user/profile/:id", {
                templateUrl: 'app/views/userProfile.html',
                controller: "userProfileCtrl"
            })
            .when("/user/add", {
                templateUrl: 'app/views/userAdd.html',
                controller: "userAddCtrl"
                
            })
            .when('/user/update/:id', {
                templateUrl: 'app/views/userUpdate.html',
                controller: "userUpdateCtrl"
                
            })
            .when("/device/:id", {
                templateUrl: 'app/views/device.html',
                controller: "devicesCtrl",
                resolve: {
                    listeEvent : function(deviceEventFactory){
                        return deviceEventFactory.query();
                    }
                }
                
            })
            .when("/device/:id/graph", {
                templateUrl: 'app/views/deviceGraph.html',
                controller: "devicesGraphCtrl"
                
                
            })
            .when("/device/:id/led-manager", {
                templateUrl: 'app/views/deviceLedManager.html',
                controller: "devicesLedManagerCtrl"
                
                
            })
            .otherwise({
                redirectTo: '/',

            });
    }
]);