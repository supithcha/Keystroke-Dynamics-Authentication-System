function addUser(){
	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;
    if (password.length < 12) {
        alert("Password must be at least 12 characters long");
        return false; 
    }
    
	let data = {
		"username": username,
		"password": password, 
        "keystrokes": keystrokes
	};

    // Calculate average CPM, UD, and DU for user input
    const totalKeystrokes = keystrokes.length;
    const totalUpDownTime = calculateTotalUpDownTime(keystrokes);
    const totalDownUpTime = calculateTotalDownUpTime(keystrokes);
    const avg_CPM_user = calculateCPM(totalKeystrokes, totalUpDownTime);
    const avg_UD_user = totalUpDownTime / totalKeystrokes;
    const avg_DU_user = totalDownUpTime / totalKeystrokes;

    // Include average values for user input in the data object
    data.avg_CPM_user = avg_CPM_user;
    data.avg_UD_user = avg_UD_user;
    data.avg_DU_user = avg_DU_user;

    // Calculate average CPM, UD, and DU for password input
    if (password) {
        const passwordKeystrokes = password.split('').map((key, index) => ({
            key,
            timestamp: Date.now() + index * 10 // Use a simple timestamp for demonstration
        }));
        const totalPasswordKeystrokes = passwordKeystrokes.length;
        const totalUpDownTimePassword = calculateTotalUpDownTime(passwordKeystrokes);
        const totalDownUpTimePassword = calculateTotalDownUpTime(passwordKeystrokes);
        const avg_CPM_pass = calculateCPM(totalPasswordKeystrokes, totalUpDownTimePassword);
        const avg_UD_pass = totalUpDownTimePassword / totalPasswordKeystrokes;
        const avg_DU_pass = totalDownUpTimePassword / totalPasswordKeystrokes;

        // Include average values for password input in the data object
        data.avg_CPM_pass = avg_CPM_pass;
        data.avg_UD_pass = avg_UD_pass;
        data.avg_DU_pass = avg_DU_pass;
    }

	fetch("http://localhost:3000/addUser", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			if (data.status == "success") {
				alert("User has been added successfully!");
                console.log(data);
                keystrokes = [];
				window.location.reload();
			} else {
				alert("Error!! Please try again");
			}
		})
		.catch((error) => {
			console.error('Error:', error);
			alert("Error!! Please try again");
	});
}

let keystrokes = [];
let currentInput = '';

document.addEventListener('DOMContentLoaded', function() {
    let startTime = null;
    let totalKeystrokes = 0;
    let totalUpDownTime = 0;
    let totalDownUpTime = 0;

    document.addEventListener('keydown', function(event) {
        if (document.getElementById("password").value.length < 12) {
            return; // Don't capture keystrokes if password length is less than 12
        }
        const key = event.key;
        const timestamp = new Date().getTime();
        keystrokes.push({ key, timestamp });
        currentInput += key; // Update the current input value

        if (!startTime) {
            startTime = timestamp;
        } else {
            totalKeystrokes++;
            const elapsedTime = timestamp - startTime;
            totalUpDownTime += elapsedTime;
            startTime = timestamp;
        }
    });

    document.addEventListener('keyup', function(event) {
        const timestamp = new Date().getTime();
        const elapsedTime = timestamp - startTime;
        totalDownUpTime += elapsedTime;
        startTime = timestamp;
    });

    document.getElementById('signup-button').addEventListener('submit', function() {
        if (document.getElementById("password").value.length < 12) {
            return; // Don't capture keystrokes if password length is less than 12
        }
        else {
        const avg_CPM_user = calculateCPM(totalKeystrokes, totalUpDownTime);
        const avg_UD_user = totalUpDownTime / totalKeystrokes;
        const avg_DU_user = totalDownUpTime / totalKeystrokes;

        // Display the averages on the web page
        const averagesElement = document.getElementById('averages');
        averagesElement.innerHTML = `
            <p>Average CPM: ${avg_CPM_user}</p>
            <p>Average UD: ${avg_UD_user} ms</p>
            <p>Average DU: ${avg_DU_user} ms</p>
        `;
        }
    });
});

function calculateCPM(totalKeystrokes, totalUpDownTime) {
    const totalTimeMinutes = totalUpDownTime / (1000 * 60); // Convert milliseconds to minutes
    return totalKeystrokes / totalTimeMinutes;
}

function calculateTotalUpDownTime(keystrokes) {
    let totalUpDownTime = 0;
    for (let i = 1; i < keystrokes.length; i++) {
        totalUpDownTime += keystrokes[i].timestamp - keystrokes[i - 1].timestamp;
    }
    return totalUpDownTime;
}

function calculateTotalDownUpTime(keystrokes) {
    let totalDownUpTime = 0;
    for (let i = 0; i < keystrokes.length - 1; i++) {
        totalDownUpTime += keystrokes[i + 1].timestamp - keystrokes[i].timestamp;
    }
    return totalDownUpTime;
}

