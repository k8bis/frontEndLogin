const packageJSON = require("../package.json");

const appName = packageJSON.name;
const express = require('express');
const router = express.Router();
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
    
    let infoUser = await getJSON(process.env.API_SERVER + '/authentication/' + user+ '&' +pass);
    if (infoUser.estatus == 'ok'){
        let catUsuarios = await getJSON(process.env.API_SERVER + '/getCatUsuarios');

        req.session.loggedin = true;                
        req.session.name = infoUser.nombre;
        req.session.idroles = infoUser.idrol;
        req.session.idusers = infoUser.iduser;
        req.session.email = user;

        const grales = {title: appName,
            login: true,
            name: infoUser.nombre,
            idrol: infoUser.idrol,
            email: user,
            iduser: infoUser.iduser,
        };

        res.render('index',{grales:grales,catUsuarios:catUsuarios.users});
    }else{
        res.render('login', {
            title: 'error',
            alert: infoUser.estatus
        })
    };
});

router.post('/forgot', async(req,res)=>{
    const email = req.body.email;

    let resultado = await getJSON(process.env.API_SERVER + '/getCatUsuarios/0&'+ email);

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

    let resultado = await getJSON(process.env.API_SERVER + '/addUpdateUsers?idusers=0' +
                                                            '&email=' + email +
                                                            '&nombres=' + name +
                                                            '&idroles=' + rol + 
                                                            '&pass=' + pass );

    if(!resultado.result === 'ok'){
        console.log(resultado);
    }else{
        res.redirect('/'); 
    };
});

router.post('/profile',async(req,res)=>{
    var {idusers, nombres, email, pass} = req.body;

    //console.log(req.body);

    let result = await getJSON(process.env.API_SERVER + '/addUpdateUsers?idusers=' + idusers +
                                                        '&email=' + email +
                                                        '&nombres=' + nombres +
                                                        '&idroles=0' + 
                                                        '&pass=' + pass );
    
    if(result.result == 'ok'){
        req.session.name = nombres;
        res.redirect('/'); 
    }else{
        console.log(result);
    };

    //console.log(result);
});

router.post('/addTickets',async(req,res)=>{
    const infoTicket = { idTicket: 0,
        ticketDescripcion: req.body.ticketsDescripcion,
        idUserAlta: parseInt(req.session.idusers),
        idUserAsignado: parseInt(req.body.idusersAsignado),
        ticketCierre: null
    };

    let resultado = await getJSON(process.env.API_SERVER + '/addUpdateTickets?idTicket='+ infoTicket.idTicket + 
                                                            '&ticketDescripcion=' + infoTicket.ticketDescripcion + 
                                                            '&idUserAlta=' + infoTicket.idUserAlta +
                                                            '&idUserAsignado=' + infoTicket.idUserAsignado +
                                                            '&ticketCierre=' + infoTicket.ticketCierre);

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
});

module.exports = router;