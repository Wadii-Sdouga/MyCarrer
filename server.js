const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
var flash = require('express-flash');
var session = require('express-session');
var bodyParser = require('body-parser');
const connection = require('./DBService');
var router = express.Router();
const port = process.env.PORT || 5000;





app.use(session({
    secret: '123456cat',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());


app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/public', express.static('public'));

//******************************************************carrer route *******************************************

app.post('/carrer', (req, res) => {
    var format = req.body.format;
    connection.query("SELECT nomT FROM carrer C,technologie T WHERE c.titre = ? and c.idc=t.idc;", [format],
        function (error, results, fields) {

            if (error) throw (err);
            req.session.format = format;

            res.render('carriere', { data: results, name: '' });

        });

});

app.get('/carrer', (req, res) => {
    res.render('carriere', { data: '', name: '' });
})

//*******************************************************profil route*********************************************
app.post('/profil', (req, res) => {

    connection.query("SELECT idt FROM carrer C,technologie T WHERE c.titre = ? and c.idc=t.idc;", [req.session.format],
        function (error, result, fields) {
            if (error) throw (err);
          
            connection.query("SELECT idu FROM user WHERE email = ?;", [req.session.email], 
            function (error, results, fields) {
                if (error) throw (err);
           
               
                for (var i = 0; i < result.length; i++) {

                    k = "rate" + i.toString();
                   
                    rate = req.body[k];
                    connection.query("INSERT INTO niveau (idn,niv,idu,idt ) VALUES (0,?,?,? );", [rate,results[0],result[i].idt], 
                    function (error, result, fields) {
                        if (error) throw (error);
                        console.log("success ");
                    });
        
                   
                }




            });
        });
});




app.get('/profil', (req, res) => {

    connection.query("SELECT nomT FROM carrer C,technologie T WHERE c.titre = ? and c.idc=t.idc;", [req.session.format],
        function (error, results, fields) {

            if (error) throw (err);
            res.render('Profil', { data: results });
        });
})



//***********************************************************login route ***********************************
app.post('/login', (request, response) => {

    var email = request.body.email;

    var hashedPassword1 = bcrypt.hashSync(request.body.password, 10);
    if (email && bcrypt.compareSync(request.body.password, hashedPassword1)) {
        connection.query('SELECT * FROM user WHERE email = ? ', [email], function (error, results, fields) {

            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.email = email;
                //request.session.idu= results.idu;


                response.render('carriere', { data: '', name: request.session.name });
            } else {
                response.render('Login', { message: "user doesn't exist " });
            }

        });
    } else {
        response.render('Login', { message: 'remplir les champs ' });
    }
});

app.get('/login', (req, res) => {
    res.render('login', { title: "login" });
})



//**************************************************************Signup route ***************************************


app.post('/register', (request, response) => {


    const { name, email, tel } = request.body;
    var password1 = request.body.password1;
    var password2 = request.body.password2;

    var hashedPassword = bcrypt.hashSync(password1, 10);


    if (password1.localeCompare(password2) == 0) {

        connection.query('SELECT * FROM user WHERE email = ?', [email], function (error, results, fields) {

            if (results.length == 0) {
                connection.query("INSERT INTO user(idu,nom,email,numTel,mdp ) VALUES (0,?,?,?,?);", [name, email, tel, hashedPassword], function (error, results, fields) {

                    request.session.loggedin = true;
                    request.session.name = name;
                    console.log(error);
                    response.render('Login', { message: 'register with successed ' });

                });
            }
            else {
                response.render('SignUp', { message: 'User already exist' });
            }
        });
    }
    else {

        response.render('SignUp', { message: 'Mot de passe incompatible' });

    }
});

app.get('/register', (req, res) => {
    res.render('SignUp', { title: "SignUp" });
})

app.listen(port, () => { console.log("app is running") });