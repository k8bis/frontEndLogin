const packageJSON = require("../package.json");

const appName = packageJSON.name;
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const connection = require('../database/db');
const bent = require('bent');
const getJSON = bent('json');


router.get('/',async (req,res)=>{
    if(req.session.loggedin){
        let catUsuarios = await getJSON( process.env.API_SERVER + '/getCatUsuarios');

        const grales = {title: appName,
            login: true,
            name: req.session.name,
            idrol: req.session.idroles,
            email: req.session.email,
            iduser:req.session.idusers
        };

        res.render('index',{grales:grales,catUsuarios:catUsuarios.users});
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

router.post('/auth', async (req, res)=> {
    const user = req.body.user;
    const pass = req.body.pass;
    
    connection.query('SELECT * FROM users WHERE email = ?', [user], async (error, results)=> {
        if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass)) ) { 
            res.render('login', {
                title: 'error',
                alert: 'Usuario y/o Contraseña Incorrectos.'
            })
        }else{
            const iduser = results[0].idusers;

            req.session.loggedin = true;                
            req.session.name = results[0].nombres;
            req.session.idroles = results[0].idroles;
            req.session.idusers = iduser;
            req.session.email = user;

            let catUsuarios = await getJSON(process.env.API_SERVER + '/getCatUsuarios');

            const grales = {title: appName,
                login: true,
                name: results[0].nombres,
                idrol: results[0].idroles,
                email: user,
                iduser: iduser,
            };

            res.render('index',{grales:grales,catUsuarios:catUsuarios.users});
        };
    })
});

router.post('/forgot', async(req,res)=>{
    const email = req.body.email;

    //validamos si existe el correo
    let resultado = await getJSON(process.env.API_SERVER + '/getCatUsuarios/0&'+ email);
    //console.log(JSON.stringify(resultado[0].idusers));
    //const idusers = resultado.users;

    const iduser = resultado[0].idusers;

    if (iduser > 0){
        let user = await getJSON(process.env.API_SERVER + '/forgotPassword/'+ iduser);
         
        res.render('forgot-password',{
        title: 'Recuperar Contraseña',
        alert: 'La contraseña temporal se ha enviado al correo registrado.'});   
    };
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

router.get('/register',(req,res)=>{
    if (req.session.loggedin){
        res.render('register');
    }else{
        res.render('index',{
            title: appName,
            login: true,
            name: req.session.name,
            idrol: req.session.idroles,
            email: req.session.email
        });
    }
});

router.post('/register', async (req,res)=>{
    const email = req.body.email;
    const name = req.body.nombres;
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
    const infoTicket = { idTicket: 0,
        ticketDescripcion: req.body.ticketsDescripcion,
        idUserAlta: parseInt(req.session.idusers),
        idUserAsignado: parseInt(req.body.idusersAsignado),
        ticketCierre: null
    };
    console.log('infoTicket: ' + JSON.stringify(infoTicket));
    //let resultado = await getJSON(process.env.API_SERVER + '/addUpdateTickets',infoTicket);
    let resultado = await getJSON(`http://45.33.3.22:3001/addUpdateTickets?idTicket=0&ticketDescripcion=prod prueba servicio arriba1&idUserAlta=1&idUserAsignado='15'&ticketCierre=null`);
    console.log('resultado: ' + resultado);
    if(!resultado.result === 'ok'){
        console.log(resultado);
    }else{
        res.redirect('/'); 
    }
});

router.post('/closeTicket',async(req,res)=>{
    const infoTicket = { idTicket: req.body.noTicket,
        ticketDescripcion: null,
        idUserAlta: 0,
        idUserAsignado: 0,
        ticketCierre: req.body.ticketsCierre
    };

    let resultado = await getJSON(process.env.API_SERVER + '/addUpdateTickets',infoTicket);

    if(!resultado.result === 'ok'){
        console.log(resultado);
    }else{
        res.redirect('/'); 
    }
/*    const noTicket     = req.body.noTicket;
    const ticketsCierre = req.body.ticketsCierre;

    console.log(noTicket);

    const query = "CALL ticketsUpdateOrInsert(?,null,null,null,?);";

    console.log(noTicket+' : '+ticketsCierre);

    connection.query(query,[noTicket,ticketsCierre],(error,results,fields)=>{
        if(error){
            console.log(error);
        }else{
            res.redirect('/');            
        }
    })
        */
});

module.exports = router;