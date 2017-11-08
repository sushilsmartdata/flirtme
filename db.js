/*
 * The file will take care of the database connectivity
 */
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/squadapp');
//mongoose.connect('mongodb://FlirtMe:FlirtMe2780@52.39.212.226:27017/FlirtMe');

mongoose.connect('mongodb://FlirtMe:FlirtMe2780@localhost:27017/FlirtMe');//check if we are connected successfully or not
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));