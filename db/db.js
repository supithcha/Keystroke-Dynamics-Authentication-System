const express = require('express');
const path = require('path');
const dotenv = require("dotenv");
const app = express();
dotenv.config();
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

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
    // dbConn.query('SELECT * FROM user_account WHERE username = "supithcha" AND password = "u6488045" ', function (error, results) {
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



router.post('/db_login', function (req, res) {
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
    console.log('totalKeystrokesUser', totalKeystrokesUser, 'passwordKeystrokes', passwordKeystrokes);
    console.log('totalKeystrokesPass', totalKeystrokesPass);

    dbConn.query('SELECT * FROM user_account WHERE username = ? AND password = ?', [req.body.username, req.body.password],
        function (error, results, fields) {
            if (error) {
                res.json({ 'status': 'error', 'message': "error" })
            } else if (results.length == 0) {
                res.json({ 'status': 'error', 'message': 'Invalid username or password' })
            } else {
                // average keystroke values
                let stored_avg_CPM_user = calculateAverageKeystrokes(results).avg_CPM_user;               
                let stored_avg_UD_user = calculateAverageKeystrokes(results).avg_UD_user;
                let stored_avg_DU_user = calculateAverageKeystrokes(results).avg_DU_user;
                let stored_avg_CPM_pass = calculateAverageKeystrokes(results).avg_CPM_pass;
                let stored_avg_UD_pass = calculateAverageKeystrokes(results).avg_UD_pass;
                let stored_avg_DU_pass = calculateAverageKeystrokes(results).avg_DU_pass;

                // Calculate similarity using some metric (e.g., absolute difference)
                let similarity_user = calculateSimilarity(avg_CPM_user, stored_avg_CPM_user)
                                        + calculateSimilarity(avg_UD_user, stored_avg_UD_user)
                                        + calculateSimilarity(avg_DU_user, stored_avg_DU_user);
                let similarity_pass = calculateSimilarity(avg_CPM_pass, stored_avg_CPM_pass)
                                        + calculateSimilarity(avg_UD_pass, stored_avg_UD_pass)
                                        + calculateSimilarity(avg_DU_pass, stored_avg_DU_pass);
                
                let similarityThreshold = 0.1; 
                console.log('similarity_user', similarity_user, 'similarity_pass', similarity_pass);
                console.log('stored_avg_CPM_user', stored_avg_CPM_user);
                console.log('stored_avg_CPM_pass', stored_avg_CPM_pass);

                let tokens = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
                if (similarity_user >= similarityThreshold && similarity_pass >= similarityThreshold) {
                    // Authentication successful
                    res.json({ status: 'success', token: tokens, message: 'Login Success' })
                    
                } else {
                    // Authentication failed
                    console.log('similarity_user',similarity_user);
                    console.log('similarity_pass',similarity_pass);
                    res.json({ 'status': 'error', 'message': 'Invalid keystroke pattern' })
                }
            }
        });

    dbConn.query(
        'INSERT INTO user_account (username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass],
        function (error, results, fields) {
            if (error) {
                res.json({ 'status': 'error', 'message': error })
            } else {
                res.json({ status: 'success', message: 'Add user login' })
            }
        }
    );
});

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

router.post('/addUser', function (req, res) {
    try {
        const { username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass } = req.body;

        dbConn.query('INSERT INTO user_account (username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass],
            function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return res.status(500).send({ status: 'error', message: 'Failed to add user.' });
                }
                return res.status(200).send({ status: 'success', data: results, message: 'User added successfully.' });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'error', message: 'An unexpected error occurred.' });
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


function calculateAverageKeystrokes(userKeystrokes) {
    let totalKeystrokes = userKeystrokes.length;
    let totalCPM_user = 0;
    let totalUD_user = 0;
    let totalDU_user = 0;
    let totalCPM_pass = 0;
    let totalUD_pass = 0;
    let totalDU_pass = 0;

    for (let i = 0; i < totalKeystrokes; i++) {
        totalCPM_user += userKeystrokes[i].avg_CPM_user || 0;
        totalUD_user += userKeystrokes[i].avg_UD_user || 0;
        totalDU_user += userKeystrokes[i].avg_DU_user || 0;
        totalCPM_pass += userKeystrokes[i].avg_CPM_pass || 0;
        totalUD_pass += userKeystrokes[i].avg_UD_pass || 0;
        totalDU_pass += userKeystrokes[i].avg_DU_pass || 0;
    }

    let avg_CPM_user = totalCPM_user / totalKeystrokes;
    let avg_UD_user = totalUD_user / totalKeystrokes;
    let avg_DU_user = totalDU_user / totalKeystrokes;
    let avg_CPM_pass = totalCPM_pass / totalKeystrokes;
    let avg_UD_pass = totalUD_pass / totalKeystrokes;
    let avg_DU_pass = totalDU_pass / totalKeystrokes;

    return { avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass };
}

function calculateSimilarity(storedValue, currentValue) {
    // Calculate cosine similarity
    // let dotProduct = storedValue.reduce((acc, val, i) => acc + (val * currentValue[i]), 0);
    // let storedMagnitude = Math.sqrt(storedValue.reduce((acc, val) => acc + (val * val), 0));
    // let currentMagnitude = Math.sqrt(currentValue.reduce((acc, val) => acc + (val * val), 0));
    // return dotProduct / (storedMagnitude * currentMagnitude);
    return Math.abs(storedValue - currentValue);
}



