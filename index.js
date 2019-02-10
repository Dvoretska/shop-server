const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = new express();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const parser = require('body-parser');
const cors = require('cors');
const busboy = require('connect-busboy');
const accounts = require('./accounts/models');
const multipleUpload = require('./services/multipleUpload');
const cookieParser = require('cookie-parser');
const knex = require('./knex.js');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const auth = require('./auth');



require('./auth.js')(passport);

app.use(passport.initialize());

var whitelist = ['http://localhost:4200', 'https://shoping-app.herokuapp.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

// const store = new KnexSessionStore({
//   knex: knex,
//   tablename: 'sessions'
// });

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   store: store
// }));

app.use(cors(corsOptions));

app.use(parser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(parser.json());
app.use(busboy());
app.use(multipleUpload);

app.use(express.static('public'));

app.get('/auth/google', function(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email']})(req, res, next)
});

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect:'/', session: false}),
    (req, res) => {
      const payload = {id: req.user.attributes.user_id};
      const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
      res.redirect("http://localhost:4200?token=" + token);
    }
);

app.use('/', require('./accounts/routes'));
app.use('/', require('./blog/routes'));
app.use('/cart', require('./shop/cart/routes'));
app.use('/wishlist', require('./shop/wishlist/routes'));
app.use('/', require('./shop/products/routes'));
app.use('/', require('./shop/categories/routes'));
app.use('/', require('./shop/order/routes'));

app.use(function(req, res) {
  res.status(404).send();
});

app.use(function(err, req, res, next) {
  console.log(err);
  if(err.message) {
    res.status(400).send(err);
  } else {
    res.status(500).send({err: '500: Internal Server Error'});
  }
});

app.listen(process.env.PORT || 5000, function() {
    console.log('Example app listening on port 3000')
});

module.exports = app;
