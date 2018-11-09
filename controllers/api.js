'use strict';

module.exports = function(_, passport, User){

    return {
        SetRouting: function (router) {
            router.get('/', this.indexPage);
            router.get('/signup', this.getSignUp);
            router.get('/home', this.homePage);
            router.get('/history', this.getHistory);
            router.get('/help/:id', this.giveHelp);

            router.post('/', User.LoginValidation, this.postLogin);
            router.post('/signup', User.SignUpValidation, this.postSignUp);
            router.post('/login', User.LoginValidation, this.postLogin);
            router.post('/help', User.HelpValidation, this.submitHelp);
        },

        indexPage: (req, res) => {
            const errors = req.flash('error');
            return res.render('index', {title: 'HonestSocial | Login', messages: errors, hasErrors: true});
        },

        getSignUp: (req, res) => {
            const errors = req.flash('error');
            return res.render('signup', {title: 'HonestSocial | SignUp', messages: errors, hasErrors: true});
        },
        
        postLogin: passport.authenticate('local.login', {
            successRedirect: '/home',
            failureRedirect: '/',
            failureFlash: true
        }),
        
        postSignUp: passport.authenticate('local.signup', {
            successRedirect: '/home',
            failureRedirect: '/signup',
            failureFlash: true
        }),

        homePage: (req, res) => {
            let query = "SELECT b.id, a.name, b.tanggal as def_tanggal, DATE_FORMAT(b.tanggal, '%d %b %Y') AS tanggal, b.judul, FORMAT(b.jumlah_bantuan,0) AS jumlah_bantuan, FORMAT(IFNULL(c.terpenuhi,0),0) AS terpenuhi " +
            "FROM `bantuan` b " +
            "LEFT JOIN user_asker a on b.asker_user_id = a.id " +
            "LEFT JOIN (SELECT bantuan_id, sum(nilai_bantuan) AS terpenuhi FROM `bantuan_giver` GROUP BY bantuan_id) c on b.id = c.bantuan_id ORDER BY def_tanggal ASC";
            
                    // execute query
                    db.query(query, (err, result) => {
                        if (err) {
                            res.redirect('/');
                        }
                        res.render('home.ejs', {
                            title: "Bantuan Dibutuhkan"
                            ,bantuan: result
                        });
                    });
        },
        
        getHistory: (req, res) => {
            console.log(req.user[0].id);
            if(!req.user){
                req.flash('info', 'Session expired.');
                res.render('index.ejs', { messages: req.flash('info') });
                // res.redirect('/');
            }
            var userid = req.user[0].id;
            let query = "SELECT giver_id, FORMAT(amount,0) AS amount, type, bantuan_id, DATE_FORMAT(timestamp, '%d %b %Y') AS tanggal " +
            "FROM saldo_giver " +
            "WHERE giver_id = " + userid + " ORDER BY tanggal ASC;";
            
                    // execute query
                    db.query(query, (err, result) => {
                        if (err) {
                            res.redirect('/');
                        }
                        res.render('history.ejs', {
                            title: "History",
                            deposit: result
                        });
                    });
        },

        giveHelp: (req, res) => {
            

            if(!req.user){
                req.flash('info', 'Session expired.');
                res.render('index.ejs', { messages: req.flash('info') });
                // res.redirect('/');
            }
            var userid = req.user[0].id;
            let query = "SELECT a.name, b.id, DATE_FORMAT(b.tanggal, '%d %b %Y') as tanggal, b.judul, FORMAT(b.jumlah_bantuan,0) AS jumlah_bantuan, b.detail, FORMAT(IFNULL(c.terpenuhi,0),0) AS terpenuhi, c.giver_count " +
            "FROM `bantuan` b " +
            "LEFT JOIN user_asker a on b.asker_user_id = a.id " +
            "LEFT JOIN (SELECT bantuan_id, sum(nilai_bantuan) AS terpenuhi, count(bantuan_id) AS giver_count FROM `bantuan_giver` GROUP BY bantuan_id) c on b.id = c.bantuan_id " +
            "WHERE b.id = '" + req.params.id + "'; " +
            "SELECT cd.giver_id, cd.jumlah_credit, db.jumlah_debit, FORMAT((cd.jumlah_credit-db.jumlah_debit),0) AS total " +
            "FROM (SELECT giver_id, sum(amount) AS jumlah_credit FROM `saldo_giver` WHERE type = 'CREDIT' GROUP BY giver_id) cd " +
            "LEFT JOIN (SELECT giver_id, sum(amount) AS jumlah_debit FROM `saldo_giver` WHERE type = 'DEBIT' GROUP BY giver_id) db on cd.giver_id = db.giver_id " +
            "WHERE cd.giver_id = '" + userid + "' ";
            
                    // execute query
                    db.query(query, (err, result) => {
                        if (err) {
                            res.redirect('/');
                        }
                        res.render('help.ejs', {
                            title: "Detail Bantuan",
                            bantuan: result[0],
                            saldo : result[1]
                        });
                    });
        },
        
        submitHelp: (req, res) => {

            var help_amt = req.body.helpAmt;
            var needed = req.body.needed;
            var fulfilled = req.body.fulfilled;
            
            // const messages = [];
            // if(help_amt < 100000) {messages.push("Bantuan minimal Rp 100.000,-");}
            // if(help_amt > 5000000) {messages.push("Bantuan maksimal Rp 5.000.000,-");}
            // if(help_amt > (needed-fulfilled)) {messages.push("Bantuan melebihi yang dibutuhkan");}
            // if(messages.length > 0){
            //     req.flash('error', messages);
            //     res.redirect('/help/'+req.body.bantuanId);
            //     // res.render('/help/'+req.body.bantuanId, { messages: req.flash('info') });
            // }
            
            let query = "INSERT INTO bantuan_giver (bantuan_id, giver_user_id, tanggal_dibantu, nilai_bantuan, created_at, updated_at) " +
            "VALUES ('" + req.body.bantuanId + "', '" + req.body.giverId + "', NOW(), " + req.body.helpAmt + ", NOW(), NOW()); " +
            "INSERT INTO saldo_giver (giver_id, amount, type, bantuan_id, timestamp) " +
            "VALUES ('" + req.body.giverId + "', '" + req.body.helpAmt + "', 'DEBIT', " + req.body.bantuanId + ", NOW());";
            
            db.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                }
                res.redirect('/home');
            });
        }
    }

}