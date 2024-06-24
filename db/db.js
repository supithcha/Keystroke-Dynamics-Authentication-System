const express = require('express');
const path = require('path');
const dotenv = require("dotenv");
const app = express();
dotenv.config();
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const cors = require('cors');
app.use(cors());

var dbConn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

dbConn.connect(function (err) {
    if (err) throw err;
    console.log(`Connect DB: ${process.env.MYSQL_DATABASE}`)
});

app.use(router);
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, function () {
    console.log(`Server listening on port: ${process.env.PORT}`)
});

router.use(express.static(__dirname));
router.get('/', (req, res) => {
    dbConn.query('SELECT * FROM user_account', function (error, results) {
        if (error) {
            res.status(500).json({ 'status': 'error', 'message': error });
        } else {
            if (results.length > 0) {
                res.status(200).json({ status: 'success', data: results });
                console.log('DB port work ja');
            } else {
                res.status(404).json({ 'status': 'error' });
            }
        }
    });
});

router.post('/db_login', async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let keystrokes = req.body.keystrokes;

    // Calculate average CPM, UD, and DU for user input
    const totalKeystrokesUser = keystrokes.filter(k => k.key !== 'Enter').length;
    const totalUpDownTimeUser = calculateTotalUpDownTime(keystrokes);
    const totalDownUpTimeUser = calculateTotalDownUpTime(keystrokes);
    const avg_CPM_user = calculateCPM(totalKeystrokesUser, totalUpDownTimeUser);
    const avg_UD_user = totalUpDownTimeUser / totalKeystrokesUser;
    const avg_DU_user = totalDownUpTimeUser / totalKeystrokesUser;

    // Calculate average CPM, UD, and DU for password input
    const passwordKeystrokes = keystrokes.filter(k => k.key !== 'Enter' && k.key !== 'Tab');
    const totalKeystrokesPass = passwordKeystrokes.length;
    const totalUpDownTimePass = calculateTotalUpDownTime(passwordKeystrokes);
    const totalDownUpTimePass = calculateTotalDownUpTime(passwordKeystrokes);
    const avg_CPM_pass = calculateCPM(totalKeystrokesPass, totalUpDownTimePass);
    const avg_UD_pass = totalUpDownTimePass / totalKeystrokesPass;
    const avg_DU_pass = totalDownUpTimePass / totalKeystrokesPass;

    console.log(keystrokes);
    try {
        dbConn.query('SELECT * FROM user_account WHERE username = ?', [req.body.username],
            async function (error, results, fields) {
                if (error) {
                    res.json({ 'status': 'error', 'message': "error" })
                } else if (results.length == 0) {
                    res.json({ 'status': 'error', 'message': 'Invalid username or password' })
                } else {
                    const similarUser = results[0];
                    let storedPassword = similarUser.password;

                    // Compare the user input password with the stored hashed password
                    let passwordMatch = await comparePassword(password, storedPassword);

                    if (passwordMatch) {
                        // average keystroke values
                        let stored_avg_CPM_user = parseFloat(similarUser.avg_CPM_user) || 0;
                        let stored_avg_UD_user = parseFloat(similarUser.avg_UD_user) || 0;
                        let stored_avg_DU_user = parseFloat(similarUser.avg_DU_user) || 0;
                        let stored_avg_CPM_pass = parseFloat(similarUser.avg_CPM_pass) || 0;
                        let stored_avg_UD_pass = parseFloat(similarUser.avg_UD_pass) || 0;
                        let stored_avg_DU_pass = parseFloat(similarUser.avg_DU_pass) || 0;

                        // Calculate similarity using some metric (e.g., cosine similarity)
                        let similarity_user = calculateSimilarityUser({ avg_CPM_user, avg_UD_user, avg_DU_user }, { avg_CPM_user: stored_avg_CPM_user, avg_UD_user: stored_avg_UD_user, avg_DU_user: stored_avg_DU_user });
                        let similarity_pass = calculateSimilarityPass({ avg_CPM_pass, avg_UD_pass, avg_DU_pass }, { avg_CPM_pass: stored_avg_CPM_pass, avg_UD_pass: stored_avg_UD_pass, avg_DU_pass: stored_avg_DU_pass });


                        let similarityThreshold = 0.4;
                        console.log('similarity_user', similarity_user, '\n');
                        console.log('similarity_pass', similarity_pass);

                        let tokens = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
                        if (similarity_user >= similarityThreshold && similarity_pass >= similarityThreshold) {
                            // Authentication successful
                            res.json({ status: 'success', token: tokens, message: 'Login Success' })

                        } else {
                            // Authentication failed
                            res.json({ 'status': 'error', 'message': 'Invalid keystroke pattern' })
                        }
                    } else {
                        // Passwords do not match
                        res.json({ 'status': 'error', 'message': 'Invalid username or password' });
                    }
                }
            });

    } catch (error) {
        console.error("Error comparing passwords:", error);
        res.status(500).json({ status: 'error', message: 'Failed to compare passwords' });
    }

});

async function comparePassword(inputPassword, hashedPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(inputPassword, hashedPassword, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

router.post('/db_authen', function (req, res) {
    try {
        let checktoken = req.headers.authorization.split(' ')[1];
        let decoded = jwt.verify(checktoken, 'secretkey');
        res.json({ status: 'success', message: 'Token is valid' })
    }
    catch (err) {
        res.json({ status: 'error', message: 'Token is invalid' })
    }
});

router.post('/addUser', async (req, res) => {
    try {
        const { username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass } = req.body;
        let hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(password);
        console.log(hashedPassword);
        dbConn.query('INSERT INTO user_account (username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass],
            function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return res.status(500).send({ status: 'error', message: 'Failed to add user.' });
                }
                return res.status(200).send({ status: 'success', data: results, message: 'User added successfully.' });
            });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ status: 'error', message: 'Failed to hash password' });
    }
});
router.use((req, res, next) => {
    res.status(404)
})

module.exports = router;

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

// Calculate similarity only if both storedValue and currentValue are not null
function calculateSimilarity(storedValues, currentValues) {
    if (!storedValues || !currentValues || storedValues.length !== currentValues.length) {
        return 0; // Return 0 if either storedValues or currentValues is null or their lengths don't match
    }

    let dotProduct = 0;
    let storedMagnitude = 0;
    let currentMagnitude = 0;

    // cosine similarity 
    for (let i = 0; i < storedValues.length; i++) {
        dotProduct += storedValues[i] * currentValues[i];
        storedMagnitude += Math.pow(storedValues[i], 2);
        currentMagnitude += Math.pow(currentValues[i], 2);
    }

    storedMagnitude = Math.sqrt(storedMagnitude);
    currentMagnitude = Math.sqrt(currentMagnitude);

    // Check for zero magnitude to avoid division by zero
    if (storedMagnitude === 0 || currentMagnitude === 0) {
        return 0; // Return 0 if one of the magnitudes is zero
    } else {
        return dotProduct / (storedMagnitude * currentMagnitude);
    }
}

function calculateSimilarityUser(currentValues, storedValues) {
    return calculateSimilarity(
        [currentValues.avg_CPM_user, currentValues.avg_UD_user, currentValues.avg_DU_user],
        [storedValues.avg_CPM_user, storedValues.avg_UD_user, storedValues.avg_DU_user]
    );
}

function calculateSimilarityPass(currentValues, storedValues) {
    return calculateSimilarity(
        [currentValues.avg_CPM_pass, currentValues.avg_UD_pass, currentValues.avg_DU_pass],
        [storedValues.avg_CPM_pass, storedValues.avg_UD_pass, storedValues.avg_DU_pass]
    );
}


