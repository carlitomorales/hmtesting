const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
const flash = require('connect-flash');
const passport = require('passport');

const container = require('./container');

container.resolve(function(api, _){
    
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: 'hmtesting',
        multipleStatements: true
      });
      
      con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
      global.db = con;
    const app = SetupExpress();

    function SetupExpress(){
        const app = express();
        const server = http.createServer(app);
        server.listen(3000, function(){
            console.log("listening on port 3000");
        });
        ConfigureExpress(app);

        //Setup  Router
        const router = require('express-promise-router')();
        api.SetRouting(router);

        app.use(router);
    }

    

    function ConfigureExpress(app){

        require('./passport/passport-local');

        app.use(express.static('public'));
        app.use(cookieParser());
        app.set('view engine', 'ejs');
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));

        app.use(validator());
        app.use(session({
            secret: 'thisissecretkey',
            resave: true,
            saveUninitialized: true,
            maxAge: 3600000          
        }))
        app.use(flash());

        app.use(passport.initialize());
        app.use(passport.session());
        app.locals._ = _;

    }

})