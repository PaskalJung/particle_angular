app.factory('userFactory', ['$resource',
function($resource) {
	return $resource('http://localhost:3000/user/list/:id', { id: '@_id'
	}, {
		update: {
			method: 'PUT'
		}
	});
}
]);
