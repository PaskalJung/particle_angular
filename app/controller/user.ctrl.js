app.controller("userProfileCtrl",['$scope','$routeParams', '$http', 'userFactory', function($scope,$routeParams, $http, userFactory){
    
    $scope.monProfil = userFactory.get({id : $routeParams.id});

}]);

app.controller("userAddCtrl", function($scope, $rootScope, userFactory, $window) {
    
    $scope.eleve = new userFactory();

    $scope.addEleve = function(eleve) { // Delete a movie. Issues a DELETE to /api/movies/:id
        response = eleve.$save();
        $window.location.href = '/';
    };
    
});

app.controller("userUpdateCtrl", function($scope, $rootScope, userFactory, $routeParams, $window) {

    $scope.eleve = userFactory.get({id : $routeParams.id});
    
    $scope.updateEleve = function(eleve) { 
        eleve.$update(eleve);
        $window.location.href = '/';
    };
   

    
});