const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const connection = require('../database/db');
//const transporter = require('../nodemailer/email');
const nodemailer = require('nodemailer');

const  generateRandomString = (num) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
            login: true,
            name: req.session.name
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
    const newPassword = '1234';//generateRandomString(5);

    let passwordHaash = await bcryptjs.hash(newPassword, 8);

    if (email.length == 0){
        res.render('forgot-password',{
            title: 'Recuperar Contraseña',
            alert: 'Capture un correo valido.'
        })
    }else{
        connection.query('SELECT idusers,email,nombres,pass FROM users WHERE email = ?',[email], async (error,results,fields)=>{
            if ( results.length > 0 ) {
                const {idusers,email,nombres,pass} = results[0];
                const query = 'CALL userUpdateOrInsert( ?, null,null,null,?);';
                
                console.log(idusers+ ' : ' + newPassword);

                connection.query(query,[idusers,passwordHaash],(error,results,fields)=>{
                    if(!error){
/*                        const transporter = nodemailer.createTransport({
                            host:'smtp-mail.outlook.com',
                            port: 587,
                            secure: false,
                            auth:{
                                user:'jr.rodriguezd@hotmail.com',
                                pass: 'Cochobis3566'
                            },
                            tls:{
                                rejectUnauthorized: false
                            }
                        });
                        
                        contentHTML = `
                            <H1> User Information </H1>
                            <ul>
                                <li>Email: ${email} </li>
                                <li>Contraseña Temporal: ${newPassword} </li>
                            </ul>
                            <p>Se solicito el cambio de su contraseña al sistema de tickets PriceSoft. Recuerda que debes entrar al sistema y personalizar tu contraseña.</p>
                        `;

                        console.log(contentHTML);
        
                        const info =  await transporter.sendMail({
                            from: "'RodelSoft Tickets' <jr.rodriguezd@hotmail.com>",
                            to: email,
                            subject:'RodelSoft Tickets Recupera tu contraseña',
                            html: contentHTML
                        });*/
                        res.render('forgot-password',{ 
                            title: 'Recuperar Contraseña',
                            alert: 'Correo enviado Satisfactoriamente.'
                        });
                    }else{
                        console.log(err);
                    }
                });
            }else{
                res.render('forgot-password',{ 
                    title: 'Recuperar Contraseña',
                    alert: 'Correo inexistente.'
                }); 
            }
        })
    }

});

/*
router.get('/register',(req,res)=>{
    if (req.session.loggedin){
        res.render('register');
    }else{
        res.render('index',{
            title: 'Autenticacion de usuario'
        })
    }
});
*/

router.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcryptjs.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM users WHERE email = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass)) ) {    
				res.render('login', {
                    title: 'error',
                    alert: 'Usuario y/o Contraseña Incorrectos.'
 /*                       alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'  */  
                    });
				
				//Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.name = results[0].nombres;
				res.render('index', {
                    title:'ok',
                    login: true,
                    name: req.session.name
/*					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''*/
				});        			
			}			
			res.end();
		});
	} else {	
        res.render('login', {
            title: 'error',
            alert: 'Capture su usuario y su contraseña.'
        });
/*		res.send('Please enter user and Password!');
		res.end();*/
	}
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

module.exports = router;