const passport = require('passport');
const jwt = require('jsonwebtoken');

const isAuthenticated = passport.authenticate('jwt', {session: false});

module.exports = {isAuthenticated };