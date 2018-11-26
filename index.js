const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = new express();
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const parser = require('body-parser');
const cors = require('cors');
const busboy = require('connect-busboy');
const accounts = require('./accounts/models');
const multipleUpload = require('./services/multipleUpload');


const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY
};

const strategy = new JwtStrategy(opts, (payload, next) => {
  accounts.User.forge({id: payload.id}).fetch().then(res => {
    next(null, res);
  });
});

passport.use(strategy);
app.use(cors());
app.use(passport.initialize());
app.use(parser.urlencoded({
  extended: false
}));
app.use(parser.json());
app.use(busboy());
app.use(multipleUpload);
app.use(express.static('public'));


app.use('/', require('./accounts/routes'));
app.use('/', require('./blog/routes'));
app.use('/', require('./shop/cart/routes'));
app.use('/', require('./shop/wishlist/routes'));
app.use('/', require('./shop/products/routes'));
app.use('/', require('./shop/order/routes'));

var server = app.listen(process.env.port || 3000);

module.exports = {
  server : server,
  app : app
};
