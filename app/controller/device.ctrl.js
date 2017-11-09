app.controller("devicesCtrl", function($scope, $http, $routeParams, deviceFactory, listeEvent ) {
    
    $scope.idDevice = $routeParams.id;
    $scope.deviceEvents = [];
    $scope.deviceEvents = listeEvent;

    var socket = io.connect();
    
    deviceFactory.get( {id: $routeParams.id}, function(data){
        $scope.device = data;
    }); 
    
    socket.on('newEvent',function(data){
        $scope.deviceEvents.unshift(data);
        $scope.$apply();
    });

});

app.controller("devicesGraphCtrl", function($scope, $http, $routeParams, deviceFactory ) {
    
    $scope.idDevice = $routeParams.id;
    
    deviceFactory.get( {id: $routeParams.id}, function(data){
        device = data;
        $scope.device = data;
    });
    
    var socket = io.connect();
    $scope.load = true;

    socket.on("Intensity", function(socket) {

        var intensity = parseInt(socket.data);
        var name = device.name;
        
        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            theme: "light2", // "light1", "light2", "dark1", "dark2"
            
            axisY: {
                title: "Intensity"
            },
            data: [{        
                type: "column",  
                showInLegend: true, 
                legendMarkerColor: "grey",
                legendText: "Value",
                dataPoints: [      
                    { y: intensity , label: name } 
                ]
            }]
        });
        $scope.chart = chart.render();
        $scope.$apply();
    });

});
app.controller("devicesLedManagerCtrl", function($scope, $http, $routeParams, deviceEventFactory, deviceFactory ) {
    
    $scope.idDevice = $routeParams.id;
    
    deviceFactory.get( {id: $routeParams.id}, function(data){
        $scope.device = data;
    });

    deviceEventFactory.save({}, function(data){
        $scope.ledStatus = data.status;
    });
    
    $scope.changeStatus = function() {
        deviceEventFactory.save({}, function(data){
            $scope.ledStatus = data.status;
        });
    };

    var socket = io.connect();
        
    socket.on("ledStatus",function(socket){
        $scope.ledStatus = socket.status;
        $scope.$apply();
    });

});

app.controller('twitCtrl', ['$scope', function($scope){
    $scope.twitListe=[];
    $scope.load = true;
    
    var socket = io.connect();

    socket.on("newTwit",function(socket){
        $scope.twitListe.push(socket);
        $scope.load = false;
        $scope.$apply();
    });
}])

app.filter('sinceFilter', ['moment', function(moment){
    return function(date){
        return moment(date).fromNow();
    }
}])
