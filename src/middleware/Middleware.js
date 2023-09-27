const jwt = require("jsonwebtoken");
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
module.exports = new authToken();
