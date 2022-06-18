const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const session = require('express-session');
app.use(session({
    secret: 'Rodolfo',
    resave: true,
    saveUninitialized: true
}));

app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const indexRoute = require('./routes/index');
app.use(indexRoute);

app.listen(3000,(req,res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});