const firebase = require('../node_modules/firebase');
var DatabaseConfig = require('../config.json').firebase;
DatabaseConfig['apiKey'] = require('../config.json').firebaseServerAPIKey;

firebase.initializeApp(DatabaseConfig);
exports.firebase = firebase;

const database = firebase.database();
exports.database = database;

const firestore = firebase.firestore().settings({ timestampsInSnapshots: true });
exports.firestore = firestore;

/**
* @author Alisamar Husain
* 
* Standard Firebase/Firestore Export
* ---------------------------------
* Import the object by either
*   const db = require('./Database')
* or
*   import db from './Database';
* 
* Use the object to get a database
* namespace by 'db.firebase.database()'
* Check the firebase docs for more.
*/