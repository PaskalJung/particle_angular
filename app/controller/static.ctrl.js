app.controller("homeCtrl", function($scope, $http, userList, deviceList, userFactory ) {
    
    $scope.usersList = userList;
    $scope.devicesList = deviceList;
    
    
    $scope.deleteUser = function(user, index) { // Delete a movie. Issues a DELETE to /api/movies/:id
        user.$delete();
        $scope.usersList.splice(index, 1);
    };

});