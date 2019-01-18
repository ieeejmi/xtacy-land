/**
 * @author Alisamar Husain
 * Temporary Server for the fest website
 */

const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const vhost = require('vhost');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ServerConfig = require('./config.json');
const __domain = require('./config.json').domain;

const xtacy = express();
const homepage = express();
const cdn = express();

const Security = require('./util/Security');
const ContentDelivery = require('./util/ContentDelivery');

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
    layoutsDir: __dirname + '/public/layouts',
    partialsDir: [
        __dirname + '/public/partials'
    ]
}))

homepage.use('/static', express.static( path.join(__dirname, 'homepage', 'static') ))

cdn.use(bodyParser.json())
cdn.use(bodyParser.urlencoded({ extended: true }))
cdn.use(express.json())
cdn.use(express.urlencoded({ extended: true }))
cdn.use(express.static( path.join(__dirname, 'cdn', 'root') ))

// ----------- Virtual Host ----------
xtacy.use(vhost(__domain, homepage))
xtacy.use(vhost('www.' +  __domain, homepage))
xtacy.use(vhost('cdn.' +  __domain, cdn))

xtacy.listen(PORT, ()=>{
    console.log('\tServer Running');
})

// =============================================================== //
// ROUTING ----------------------------------------------- ROUTING //
// =============================================================== //

homepage.get('/', (req,res)=>{
    res.render('index', { 'title' : 'HOME' })
});

homepage.get('/_secu/csrtoken/', (req,res)=>{
    // == Webpage CSRF Token Generation == //
    Security.generateCSRFTokens()
        .then((result)=>{
            res.json({ key : result.key, token : result.token })
        }).catch((error)=>{
            console.error(error)
            res.sendStatus(500)
        })
});

homepage.post('/_secu/csrtoken/', (req,res)=>{
    // == Webpage CSRF Token Validation == //
    Security.validateCSRFTokens(req.body.key, req.body.token)
        .then((result)=>{
            if (result) {
                res.json({ status : true })
            } else {
                Security.generateCSRFTokens().then((result)=>{
                    res.json({ status : false, key : result.key, token : result.token })
                }).catch((error)=>{
                    console.error(error)
                    res.sendStatus(500)
                })
            }
        }).catch((error)=>{
            console.error(error)
            res.sendStatus(403)
        })
});

// =============================================================================================

cdn.get('/', (req,res)=>{
    res.sendFile( path.resolve(__dirname, 'cdn', 'index.html') )
});

cdn.get('/p/:file/', (req,res)=>{
    if (req.params.file=='cdnLookup.json') res.sendStatus(403)
    switch(req.params.file) {
        case 'faviconpng':
            res.type('image/png')
            res.sendFile( path.resolve(__dirname, 'cdn/presets', 'favicon.png') )
            break
        case 'faviconico':
            res.type('image/x-icon')
            res.sendFile( path.resolve(__dirname, 'cdn/presets', 'favicon.ico') )
            break
        default:
            res.sendStatus(404)
    }
});

cdn.get('/d/:fileRef/', (req,res)=>{
    ContentDelivery.Lookup(req.params.fileRef)
        .then(({ filepath, filename, contentType })=>{
            res.type(contentType)
            res.sendFile( path.join(__dirname, 'cdn', filepath, filename) )
        }).catch((result, err)=>{
            console.error(result, err)
            res.sendStatus(500)
        })
});

cdn.put('/u/:filepath/:filename/', (req,res)=>{
    if (req.params.filename=='cdnLookup.json') res.sendStatus(403)
    let __filepath;
    try {
        __filepath = Buffer.from(req.params.filepath, 'base64').toString('ascii')
    } catch(err) {
        res.sendStatus(403)
    }
    
    // Upload file
    ContentDelivery.Upload(req.body.file, rer.params.filename, __filepath, 
        req.body.contentType, req.body.metadata)
        .then((fileRef)=>{
            res.json({ ref: fileRef })
        }).catch((err)=>{
            res.status(403).send(err)
        })
});