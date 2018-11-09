'use strict';

module.exports = function(_) {
    return {
        SignUpValidation: (req, res, next) => {
            req.checkBody('username', 'Username is Required').notEmpty();
            req.checkBody('username', 'Username Must Not Be Less Than 5').isLength({min: 5});
            req.checkBody('email', 'Email is Required').notEmpty();
            req.checkBody('email', 'Email is Invalid').isEmail();
            req.checkBody('password', 'Password is Required').notEmpty();
            req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({min: 5});
            
            req.getValidationResult()
                .then((result) => {
                    const errors = result.array();
                    const messages = [];
                    errors.forEach((error) => {
                        messages.push(error.msg);
                    });

                    req.flash('error', messages);
                    redirect('/signup');
                })
                .catch((err) => {
                    return next();
                })
        },

        LoginValidation: (req, res, next) => {
            req.checkBody('email', 'Email is Required').notEmpty();
            req.checkBody('email', 'Email is Invalid').isEmail();
            req.checkBody('password', 'Password is Required').notEmpty();
            req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({min: 5});
            
            req.getValidationResult()
                .then((result) => {
                    const errors = result.array();
                    const messages = [];
                    errors.forEach((error) => {
                        messages.push(error.msg);
                    });

                    req.flash('error', messages);
                    redirect('/');
                })
                .catch((err) => {
                    return next();
                })
        },

        HelpValidation: (req, res, next) => {
            req.checkBody('helpAmt', 'Bantuan minimal 100rb').isInt({min:100000});
            
            req.getValidationResult()
                .then((result) => {
                    const errors = result.array();
                    const messages = [];
                    errors.forEach((error) => {
                        messages.push(error.msg);
                    });

                    req.flash('error', messages);
                    redirect('/help/'+req.body.bantuanId);
                })
                .catch((err) => {
                    return next();
                })
        }
    }
}