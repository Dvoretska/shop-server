const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User, Oauth} = require('./accounts/models.js');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY
  };

  passport.use(new JwtStrategy(opts, (payload, cb) => {
    User.where({id: payload.id}).fetch().then(user => {
      if(!user) {
        return cb(null, false);
      }
      return cb(null, user);
      }).catch(err => {
        return cb(err)
      })
    })
  );

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
};
