app.factory('deviceFactory', ['$resource',
function($resource) {
	return $resource('http://localhost:3000/devices/:id', { id: '@_id'
	}, {
		update: {
			method: 'PUT'
		}
	});
}
]);

app.factory('deviceEventFactory', function($resource){
	return $resource('http://localhost:3000/event/:eventId',{eventId:'@id'},
	{
		update:
		{
			method : 'PUT'
		}
	});
});
