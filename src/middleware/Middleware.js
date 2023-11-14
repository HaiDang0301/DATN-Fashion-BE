const jwt = require("jsonwebtoken");
const passport = require("passport");
const FacebookTokenStrategy = require("passport-facebook-token");
const Accounts = require("../app/Models/AuthsModel");
class authToken {
  User(req, res, next) {
    const authHeader = req.headers.token;
    const token = authHeader;
    if (!token) {
      return res.send("You don't have token");
    } else {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          res.send("Wrong token");
        } else {
          if (user.role === "client") {
            req.user = user;
            next();
          } else {
            req.user = user;
            next();
          }
        }
      });
    }
  }
  Admin(req, res, next) {
    const authHeader = req.headers.token;
    const token = authHeader;
    if (!token) {
      return res.status(401).send("You don't have token");
    } else {
      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (user.role === "admin") {
          req.user = user;
          next();
        } else {
          res.status(403);
        }
      });
    }
  }
}
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      fbGraphVersion: "v3.0",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await Accounts.findOne({
          authFacebookID: profile.id,
          authType: "facebook",
        });
        if (user) {
          return done(null, user);
        } else {
          const newUser = new Accounts({
            authType: "facebook",
            authFacebookID: profile.id,
            email: profile._json.email,
            full_name: profile._json.name,
            image: { url: profile.photos[0].value },
            verify: true,
          });
          await newUser.save();
          done(null, newUser);
        }
      } catch (error) {
        console.log(error);
        done(null, false);
      }
    }
  )
);
module.exports = new authToken();
