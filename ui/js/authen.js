
function login() {
	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
	// let data = {
		// 	"username": username,
		// 	"password": password
		// };

	// Calculate keystroke metrics for username
    let usernameKeystrokes = calculateKeystrokes(document.getElementById("username"));
    let avg_CPM_user = calculateCPM(usernameKeystrokes);
    let avg_UD_user = calculateUpDownTime(usernameKeystrokes);
    let avg_DU_user = calculateDownUpTime(usernameKeystrokes);

	// Calculate keystroke metrics for password
    let passwordKeystrokes = calculateKeystrokes(document.getElementById("password"));
    let avg_CPM_pass = calculateCPM(passwordKeystrokes);
    let avg_UD_pass = calculateUpDownTime(passwordKeystrokes);
    let avg_DU_pass = calculateDownUpTime(passwordKeystrokes);


	let data = {
        "username": username,
        "password": password,
        "keystrokes": {
            "username": usernameKeystrokes,
            "password": passwordKeystrokes
        },
        "avg_CPM_user": avg_CPM_user,
        "avg_UD_user": avg_UD_user,
        "avg_DU_user": avg_DU_user,
        "avg_CPM_pass": avg_CPM_pass,
        "avg_UD_pass": avg_UD_pass,
        "avg_DU_pass": avg_DU_pass
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

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to the login page
}


// Function to calculate keystrokes for an input field
function collectKeystrokes(inputId) {
    let inputElement = document.getElementById(inputId);
    let keystrokes = [];

    inputElement.addEventListener('keydown', function(event) {
        const key = event.key;
        const timestamp = new Date().getTime();
        keystrokes.push({ key, timestamp });
    });

    return keystrokes;
}


function calculateCPM(keystrokes) {
    const totalTimeMinutes = calculateTotalUpDownTime(keystrokes) / (1000 * 60); // Convert milliseconds to minutes
    return keystrokes.length / totalTimeMinutes;
}

function calculateTotalUpDownTime(keystrokes) {
    let totalUpDownTime = 0;
    for (let i = 1; i < keystrokes.length; i++) {
        totalUpDownTime += keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
    }
    return totalUpDownTime;
}

function calculateUpDownTime(keystrokes) {
    return calculateTotalUpDownTime(keystrokes) / keystrokes.length;
}

function calculateTotalDownUpTime(keystrokes) {
    let totalDownUpTime = 0;
    for (let i = 0; i < keystrokes.length - 1; i++) {
        totalDownUpTime += keystrokes[i + 1].timestamp - keystrokes[i].timestamp;
    }
    return totalDownUpTime;
}

function calculateDownUpTime(keystrokes) {
    return calculateTotalDownUpTime(keystrokes) / keystrokes.length;
}





















