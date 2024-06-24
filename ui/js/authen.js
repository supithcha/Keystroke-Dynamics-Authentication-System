function authen() {
	const token = localStorage.getItem('token');
	fetch('http://localhost:3000/db_authen', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + token
		},
	})
		.then(response => response.json())
		.then(data_authen => {
			if (data_authen.message == 'Token is valid') {
				//pass
			} else {
				localStorage.removeItem('token');
				alert('Please login first!')
				window.location.href = '/login';
			}
			console.log('Success:', data_authen);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

function logout() {
	localStorage.removeItem('token');
	window.location.href = '/login'; // Redirect to the login page
}


