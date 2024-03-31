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
    dbConn.query('SELECT * FROM user_account', function (error, results) {
        if (error) {
            res.status(500).json({ 'status': 'error', 'message': error });
        } else {
            if (results.length > 0) {
                res.status(200).json({ status: 'success', data: results });
                console.log('DB port work ja');
            } else {
                res.status(404).json({ 'status': 'error'});
            }
        }
    });
});



router.post('/db_login', function (req, res) {
    let username = req.body.username;

    let password = req.body.password;
    let avg_CPM_user = req.body.avg_CPM_user;
    let avg_UD_user = req.body.avg_UD_user;
    let avg_DU_user = req.body.avg_DU_user;
    let avg_CPM_pass = req.body.avg_CPM_pass;
    let avg_UD_pass = req.body.avg_UD_pass;
    let avg_DU_pass = req.body.avg_DU_pass;

    dbConn.query('SELECT * FROM user_account WHERE username = ? AND password = ?', [req.body.username, req.body.password],
        function (error, results, fields) {
            if (error) {
                res.json({ 'status': 'error', 'message': error })
            } else if (results.length == 0) {
                res.json({ 'status': 'error', 'message': 'Invalid username or password' })
            } else {
                //create token
                let tokens = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
                res.json({ status: 'success', token: tokens, message: 'Login Success' })
                console.log('Username:' ,req.body.username, 'login to the system');
                console.log(results);
            }
        });

    dbConn.query(
            'INSERT INTO user_account (username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass],
            function (error, results, fields) {
                if (error) {
                    res.json({ 'status': 'error', 'message': error })
                } else {
                    console.log('Add keystroke when login');
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

// router.get('/userinfo', (req, res) => {

//     const token = req.headers.authorization.split(' ')[1];
//     // Verify the token to get the payload, which includes the username
//     jwt.verify(token, 'secretkey', function (err, decoded) {
//         if (err) {
//             res.json({ 'status': 'error', 'message': 'Token is invalid' });
//         } else {
//             // Retrieve the username from the decoded payload
//             const username = decoded.username;
//             // First query to get USER_ID
//             dbConn.query('SELECT * FROM user_account WHERE username = ?', [username], function (error, results, fields) {
//                 if (error) {
//                     res.json({ 'status': 'error', 'message': error });
//                 } else {
//                     if (results.length > 0) {
//                         return res.send({ status: 'success', data: results, message: 'Credit card' });

//                     } else {
//                         res.json({ 'status': 'error', 'message': 'User not found' });
//                     }
//                 }
//             });
//         }
//     });
// });

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

