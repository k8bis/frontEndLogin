const express = require('express');
const app = express();
/*
const nodemailer = require('nodemailer');
const{google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const accountTransport = require("./account_transport.json");

const mail_rover = async(callback) =>{
    const OAuth2Client = new OAuth2(
        accountTransport.auth.clientId,
        accountTransport.auth.clientSecret,
        "https://developers.google.com/oauthplayground",
    );
    OAuth2Client.setCredentials({
        refresh_token: accountTransport.auth.refreshToken,
        tls:{
            rejectUnauthorized: false
        }
    });
    OAuth2Client.getAccessToken((err,token)=>{
        if(err)
            return console.log(err);;
        accountTransport.auth.accessToken = token;
        callback(nodemailer.createTransport(accountTransport));
    });
};
*/

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const session = require('express-session');
app.use(session({
    secret: 'Rodolfo',
    resave: true,
    saveUninitialized: true
}));

const indexRoute = require('./routes/index');
app.use(indexRoute);

app.listen(3000,(req,res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});