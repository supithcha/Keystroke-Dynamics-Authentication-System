const express = require('express');
const path = require('path')
const port = 3030;
const app = express();


const router = express.Router();
app.use('/', express.static(path.join(__dirname, '/html')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use(router);

// Homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(`${__dirname}/html/login.html`))
});
//Log in
router.get('/login', (req, res) => {
    res.sendFile(path.join(`${__dirname}/html/login.html`))
});
//router post login
router.get('/signup', (req, res) => {
    res.sendFile(path.join(`${__dirname}/html/signup.html`))
});

router.get('/welcome', (req, res) => {
    res.sendFile(path.join(`${__dirname}/html/welcome.html`))
});

router.use((req, res, next) => {
    res.status(404)
    console.log("404: Invalid accessed")
})
app.listen(port, function () {
    console.log(`Server listening on port: ${port}`)
});












