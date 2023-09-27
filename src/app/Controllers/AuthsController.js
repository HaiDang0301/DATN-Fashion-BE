const Accounts = require("../Models/AuthsModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
process.env.TOKEN_SECRET;
class AccountsController {
  async index(req, res, next) {
    const id = req.user.id;
    const user = await Accounts.find({ _id: id });
    res.json(user);
    console.log({ id: id });
  }
  async register(req, res, next) {
    try {
      const email = req.body.email;
      const findEmail = await Accounts.findOne({ email: email });
      if (findEmail) {
        res.status(409).json("The account has been registered");
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(req.body.password, salt);
        const account = new Accounts({
          full_name: req.body.full_name,
          email: req.body.email,
          password: hashedPw,
        });
        await account.save();
        res.status(200).json("Successful account registration");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async login(req, res, next) {
    try {
      const email = await Accounts.findOne({ email: req.body.email });
      if (!email) {
        return res.status(401).json("Inventive password account information");
      }
      const password = await bcrypt.compare(req.body.password, email.password);
      if (!password) {
        return res.status(401).json("Inventive password account information");
      }
      if (email && password) {
        const token = await jwt.sign(
          {
            id: email._id,
            role: email.role,
          },
          process.env.TOKEN_SECRET,
          { expiresIn: "15d" }
        );
        const { password, ...others } = email._doc;
        const last_time_login = await Accounts.updateOne(
          { email: req.body.email },
          { last_time_login: Date.now() }
        );
        return res.status(200).json({ others, token });
      }
    } catch (error) {
      res.status(500).send("Không thể kết nối đến server");
    }
  }
}
module.exports = new AccountsController();
