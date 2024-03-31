
function login() {
	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
	let data = {
		"username": username,
		"password": password
	};

	fetch("http://localhost:3000/db_login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			if (data.status == "success") {
				localStorage.setItem("token", data.token);
				window.location.href = "/welcome";
			} else {
				alert("Invalid username or password. Please try again.");
				let invalid_login = document.getElementById("invalid_login");
				invalid_login.innerHTML = 
				` Invalid username or password `;
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

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













