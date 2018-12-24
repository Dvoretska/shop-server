const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User} = require('./accounts/models.js');

// module.exports = (passport) => {
//   passport.use('google', new GoogleStrategy({
//       clientID: credentials.authProviders.google[process.env.NODE_ENV].clientID,
//       clientSecret: credentials.authProviders.google[process.env.NODE_ENV].clientSecret,
//       callbackURL: `${process.env.BASE_URL}/auth/google/callback`
// },
//   (token, refreshToken, profile, done) => {
//     return done(null, {
//       profile: profile,
//       token: token
//     });
//   }));
// };
