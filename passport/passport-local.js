'use strict';

const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');

// const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => { //user id will be save in the session
    done(null, user.id);
});

passport.deserializeUser((id, done) => { //retrieve user data in session
    let usernameQuery = "SELECT * FROM `user_giver` WHERE id = '" + id.id + "'";
    db.query(usernameQuery, (err, result) => {
        done(err, result);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {

    let usernameQuery = "SELECT * FROM `user_giver` WHERE email = '" + email + "'";
    db.query(usernameQuery, (err, result) => {
        if (err) {
            return done(err);
        }
        if (result.length > 0) {
            return done(null, false, new Error('Email already exist'));
        } else {
            let query = "INSERT INTO `user_giver` (name, email, password, active) VALUES ('" +
            req.body.username + "', '" + req.body.email + "', '" + bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null) +
            "', 1)";
            db.query(query, (err, result) => {
                if (err) {
                    return done(err);
                }
                db.query(usernameQuery, (err, result) => {
                    done(null, {id: result[0]});
                });
            });
        }
    });

}));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    
    // let usernameQuery = "SELECT * FROM `user_giver` WHERE email = '" + email + "' AND password = '"+ bcrypt.hashSync(password, bcrypt.genSaltSync(10)) +"'";
    let usernameQuery = "SELECT * FROM `user_giver` WHERE email = '" + email + "'";
    db.query(usernameQuery, (err, result) => {
        if (err) {
            return done(err);
        }
        if (result.length < 1) {
            return done(null, false, req.flash('error', 'This email is not registered.'));
        } else {
            if(bcrypt.compareSync(password, result[0].password)){
                done(null, {id: result[0]});
            } else {
                return done(null, false, req.flash('error', 'Incorrect password.'));
            }
            
        }
    });

}));