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

    let avg_CPM_user = req.body.avg_CPM_user;
    let avg_UD_user = req.body.avg_UD_user;
    let avg_DU_user = req.body.avg_DU_user;
    let avg_CPM_pass = req.body.avg_CPM_pass;
    let avg_UD_pass = req.body.avg_UD_pass;
    let avg_DU_pass = req.body.avg_DU_pass;


    dbConn.query('SELECT * FROM user_account WHERE username = ? AND password = ?', [req.body.username, req.body.password],
        function (error, results, fields) {
            if (error) {
                res.json({ 'status': 'error', 'message': "error" })
            } else if (results.length == 0) {
                res.json({ 'status': 'error', 'message': 'Invalid username or password' })
            } else {
                
                let similarityThreshold = 0.1; 

                let tokens = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
                if (similarityThreshold >= 0) {
                    // Authentication successful
                    res.json({ status: 'success', token: tokens, message: 'Login Success' })
                    
                } else {
                    res.json({ 'status': 'error', 'message': 'Invalid keystroke pattern' })
                }
            }
        });

    dbConn.query( // Insert keystroke dynamics metrics for login
        'INSERT INTO user_account (username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass, avg_DU_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [username, password, avg_CPM_user, avg_UD_user, avg_DU_user, avg_CPM_pass, avg_UD_pass,avg_DU_pass],
        function (error, results, fields) {
            if (error) {
                res.json({ 'status': 'error', 'message': 'Unsucceccfull add' })
            } else {
                res.json({ status: 'success', message: 'Add user login' })
                console.log('add keystroke login');
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




