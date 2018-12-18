/**
 * @author Alisamar Husain
 * Temporary Server for the fest website
 */

const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const ServerConfig = require('./config.json');

const homepage = express();

const Security = require('./util/Security');

homepage.use(bodyParser.json())
homepage.use(bodyParser.urlencoded({ extended: true }))
homepage.use(express.json())
homepage.use(express.urlencoded({ extended: true }))
homepage.use( express.static( path.join(__dirname, 'public') ) )
homepage.set('views', path.join(__dirname, 'public'))
homepage.set('view engine', 'hbs')
homepage.engine('hbs', hbs({
    defaultLayout: 'main',
    extname: 'hbs',
    layoutsDir: __dirname + '\\public\\layouts',
    partialsDir: [
        __dirname + '\\public\\partials'
    ]
}))

homepage.listen(PORT, ()=>{
    console.log('\tServer Running');
})

// =============================================================== //
// ROUTING ----------------------------------------------- ROUTING //
// =============================================================== //

homepage.get('/', (req,res)=>{
    res.render('index', { 'title' : 'HOME' })
});

homepage.post('/_register/:ckey/:mode/', (req,res)=>{
    // Example of NON-PAGE REQUEST
    Security.validateCSRFTokens(req.body.key, req.body.token)
        .then((result)=>{
            // do whatever has to be done
            res.send(200)
        }).catch((error)=>{
            console.error(error)
            res.send(500)
        })
});

homepage.get('/_file/GET/:type/:path/:filename/', (req,res)=>{
    // FILE DELIVERY NETWORK
    let __path = Buffer.from(req.params.path, 'base64').toString('ascii');
    if(req.params.type==='preset' && __path==='root') {
        switch(req.params.filename) {
            case 'favicon':
                res.sendFile( path.resolve(__dirname, 'public/static/img', 'favicon.png') )
                break;
            default:
                res.send(404)
        }
    } else {
        res.send(500)
    }
});

homepage.get('/_secu/firebase/:ckey/:mode/', (req,res)=>{
    // == GET Firebase Credentials == //
    var ckey = Buffer.from(req.params.ckey, 'base64').toString('ascii')
    if(req.params.mode==='GET' && ckey===require('./config.json').clientKey){
        res.json(ServerConfig.firebase)
    } else {
        res.send(500)
    }
});

homepage.post('/_secu/csrtoken/', (req,res)=>{
    // == Webpage CSRF Token Validation == //
    Security.validateCSRFTokens(req.body.key, req.body.token)
        .then((result)=>{
            res.json({ validation : result })
        }).catch((error)=>{
            console.error(error)
            res.send(500)
        })
});