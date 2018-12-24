const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = new express();
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User, Oauth} = require('./accounts/models');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY
};

const strategy = new JwtStrategy(opts, (payload, next) => {
  console.log(payload)
  return accounts.User.forge({id: payload.id}).fetch().then(user => {
    if(!user) {
      return next(null, false);
    }
     return next(null, user);
  }).catch(err => next(err, false));
});

passport.use(strategy);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
(token, refreshToken, profile, next) => {
  Oauth.where({profile_id: profile.id}).fetch().then((oauthUser) => {
    if (oauthUser) {
      return next(null, oauthUser);
    }
    User.where({email: profile.emails[0].value}).fetch().then((user) => {
      console.log('user', user)
      if(user) {
       const oauthUser = new Oauth({
          profile_id: profile.id,
          user_id: user.attributes.id
        });
        oauthUser.save().then((newUser) => {
          return next(null, newUser)
        }).catch(err => {
          return next(err, null)
        });
      }
      const newUser = new User({
        email: profile.emails[0].value,
        password_digest: '14354566',
        image: profile.photos[0].value
      });
      newUser.save().then(result => {
        const oauthUser = new Oauth({
          profile_id: profile.id,
          user_id: result.attributes.id
        });
        oauthUser.save().then((newUser) => {
          return next(null, newUser)
        }).catch(err => {
          return next(err, null)
        });
      }).catch(err => {
        return next(err, null)
      });
    }).catch(err => {
      return next(err, null);
    })
  }).catch(err => {
    return next(err, null);
  });
}));

app.use(passport.initialize());

const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true
};

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


app.use('/', require('./accounts/routes'));
app.get('/auth/google', function(req, res, next) {
  passport.authenticate('google', { scope: ['profile', 'email']})(req, res, next)
});

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect:'/', session: false}),
    (req, res) => {
      console.log(req.user)
      const payload = {id: req.user.attributes.user_id};
      const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
      res.redirect("http://localhost:4200?token=" + token);
    }
);
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
  console.log(err)
  if(err.message) {
    res.status(400).send(err);
  } else {
    res.status(500).send({err: '500: Internal Server Error'});
  }
});

app.listen(process.env.port || 3000);
module.exports = app;
