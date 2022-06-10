const packageJSON = require("../package.json");

const appName = packageJSON.name;
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const connection = require('../database/db');
const nodemailer = require('nodemailer');

const  generateRandomString = (num) => {
//    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const characters ='0123456789';
    let result1= ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
};
 
router.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            title: appName,
            login: true,
            name: req.session.name,
            idrol: req.session.idroles,
            email: req.session.email

        });
    }else{
        res.render('login',{ 
            title: 'Autenticacion de usuario',
            login: false,
            name: '',
            alert: ''
        });
    }
});

router.get('/login',(req,res)=>{
    res.render('login',{ 
        title: 'Autenticacion de usuario',
        alert: ''
    });
});

router.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    });
});

router.get('/forgot-password',(req,res)=>{
    res.render('forgot-password',{ 
        title: 'Recuperar Contraseña',
        alert: ''
    });
});

router.post('/forgot', async(req,res)=>{
    const email = req.body.email;
    const newPassword = '1234';
    //const newPassword = generateRandomString(4);

    let passwordHaash = await bcryptjs.hash(newPassword, 8);

    if (email.length == 0){
        res.render('forgot-password',{
            title: 'Recuperar Contraseña',
            alert: 'Capture un correo valido.'
        });

    }else{
        connection.query('SELECT idusers,email,nombres,pass FROM users WHERE email = ?',[email], async (error,results,fields)=>{
            if ( results.length > 0 ) {
                const {idusers,email,nombres,pass} = results[0];
                const query = 'CALL userUpdateOrInsert( ?, null,null,null,?);';
                console.log(idusers+ ' : ' + newPassword);

                connection.query(query,[idusers,passwordHaash],(error,results,fields)=>{
                    if(error){
                        console.log(error);
                    }else{
                        res.render('forgot-password',{
                            title: 'Recuperar Contraseña',
                            alert: 'Correo Enviado.'
                        });                
                    }
                })
            }else{
                res.render('forgot-password',{
                    title: 'Recuperar Contraseña',
                    alert: 'Correo no encontrado.'
                });                
            }
        })
    }
    
});


router.get('/register',(req,res)=>{
    if (req.session.loggedin){
        res.render('register');
    }else{
        res.render('index',{
            title: appName,
            login: true,
            name: req.session.name,
            idrol: req.session.idroles
        });
    }
});


router.post('/auth', async (req, res)=> {
    const user = req.body.user;
    const pass = req.body.pass;

    let passwordHaash = await bcryptjs.hash(pass,8);
    connection.query('SELECT * FROM users WHERE email = ?', [user], async (error, results)=> {
        if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass)) ) { 
            res.render('login', {
                title: 'error',
                alert: 'Usuario y/o Contraseña Incorrectos.'
            })
        }else{
            const iduser = results[0].idusers;



            const grales = {title: appName,
                login: true,
                name: results[0].nombres,
                idrol: results[0].idroles,
                email: user
            };
        

                
            res.render('index',{grales:grales});
        };
    })

    



});

router.post('/register', async (req,res)=>{
    const email = req.body.email;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;

    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{email:email,nombres:name,idroles:rol,pass:passwordHaash}, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registro",
                alertMessage:"Alta Exitosa",
                alertIcon: 'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
    })
});

router.post('/addTickets',async(req,res)=>{
    const idusersAsignado = req.body.idusersAsignado;
    const ticketsDescripcion = req.body.ticketsDescripcion;
    const idusers = req.session.idusers;

    const query = "CALL ticketsUpdateOrInsert(0,?,?,?,null);";

    connection.query(query,[ticketsDescripcion,idusers,idusersAsignado],(error,results,fields)=>{
        if(error){
            console.log(error);
        }else{
            res.render('index',{
                title: appName,
                login: true,
                name: req.session.name,
                idrol: req.session.idroles,
                email: req.session.user
            });                 
        }
    })
        
});

module.exports = router;