const Accounts = require("../Models/AuthsModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password,
          },
        });
        var mailOptions = {
          from: process.env.Email_User,
          to: req.body.email,
          subject: "Notice: Registration Of Fashion Shop Account",
          html: "<p>You have successfully registered the account</p>",
          text: "click",
        };
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            res.status(401).json("Can't find email");
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
        });
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
  async forget(req, res, next) {
    try {
      const email = req.body.email;
      const user = await Accounts.findOne({ email: email });
      if (!user) {
        res.status(401).json("Can't not find email");
      } else {
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
          expiresIn: "300s",
        });
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password,
          },
        });
        var mailOptions = {
          from: process.env.Email_User,
          to: req.body.email,
          subject: "Notice: Reset Password",
          html: `<p>You have just requested to reset the password. Please <a href ="${process.env.Reset_PassWord}/${token}">click here</a></p>`,
        };
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            res.status(401).json("Can't find email");
          } else {
            res
              .status(200)
              .json({ token, message: "Create a successful reset password" });
          }
        });
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async reset(req, res, next) {
    const token = req.params.token;
    const password = req.body.password;
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
      if (err) {
        res.status(401).json("Wrong Token");
      } else {
        const salt = await bcrypt.genSalt(10);
        bcrypt
          .hash(password, salt)
          .then(async (hash) => {
            const reset = await Accounts.findOneAndUpdate(
              { _id: user.id },
              { password: hash }
            );
            res.status(200).json("Reset Password Success");
          })
          .catch((err) => {
            res.json(err);
          });
      }
    });
  }
}
module.exports = new AccountsController();
