let keystrokes = [];

document.addEventListener('DOMContentLoaded', function() {
    // Event listener to capture keystrokes for username input
    document.getElementById("username").addEventListener("keydown", function(event) {
        const key = event.key;
        const timestamp = Date.now(); // Get the current timestamp
        keystrokes.push({ key, timestamp });
    });

    // Event listener to capture keystrokes for password input
    document.getElementById("password").addEventListener("keydown", function(event) {
        const key = event.key;
        const timestamp = Date.now(); // Get the current timestamp
        keystrokes.push({ key, timestamp });
    });
});

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let data = {
        "username": username,
        "password": password,
        "keystrokes": keystrokes
    };

    // Clear keystrokes after capturing them
    keystrokes = [];

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
            if (data.message == "error")  {
                alert("Error. Please try again.");
            }
            else if (data.message == "Invalid username or password")  {
                alert("Invalid username or password. Please try again.");
                let invalid_login = document.getElementById("invalid_login");
                invalid_login.innerHTML = 
                ` Invalid username or password `;
            }
            else if (data.message == "Invalid keystroke pattern")  {
                alert("Invalid keystroke pattern. Please try again.");
            }
        }
        // } else {
        //     alert("Invalid username or password. Please try again.");
        //     let invalid_login = document.getElementById("invalid_login");
        //     invalid_login.innerHTML = 
        //     ` Invalid username or password `;
        // }
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

function logout() {
	localStorage.removeItem('token');
	window.location.href = '/login'; // Redirect to the login page
}
















