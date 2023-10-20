const Accounts = require("../Models/AuthsModel");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
process.env.TOKEN_SECRET;
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
class AccountsController {
  async index(req, res, next) {
    const id = req.user.id;
    const user = await Accounts.findOne({ _id: id });
    res.status(200).json(user);
  }
  async register(req, res, next) {
    let image = [];
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
          html: `<p>You have successfully registered the account.Please <a href ="${process.env.HTTP_Login}">click here</a> to login</p>`,
          text: "click",
        };
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            res.status(401).json("Can't find email");
          } else {
            const result = await cloudinary.uploader.upload(
              "https://cdn.class123.kr/assets/img/sp/img-profile-none-bg.png",
              {
                folder: "avatar/user",
              }
            );
            image = { url: result.url, public_id: result.public_id };
            const salt = await bcrypt.genSalt(10);
            const hashedPw = await bcrypt.hash(req.body.password, salt);
            const account = new Accounts({
              image: image,
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
        return res.status(401).json("Wrong account or password information");
      }
      const password = await bcrypt.compare(req.body.password, email.password);
      if (!password) {
        return res.status(401).json("Wrong account or password information");
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
      res.status(500).send("Connect server false");
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
          html: `<p>You have just requested to reset the password. Please <a href ="${process.env.Reset_Password}/${token}">click here</a> to reset password</p>`,
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
  async update(req, res, next) {
    const id = req.user.id;
    const fileUpload = req.files;
    const full_name = req.body.full_name;
    const phone = req.body.phone;
    const password = req.body.password;
    const city = req.body.city;
    const district = req.body.district;
    const ward = req.body.ward;
    const home = req.body.home;
    let profile = {
      full_name: full_name,
      phone: phone,
      address: {
        city: city,
        district: district,
        ward: ward,
        address_home: home,
      },
    };
    try {
      if (fileUpload) {
        let file = {};
        const findUser = await Accounts.findOne({ _id: id });
        await cloudinary.uploader.destroy(findUser.image.public_id);
        const result = await cloudinary.uploader.upload(
          fileUpload.image.tempFilePath,
          { folder: "avatar/user" }
        );
        file = { url: result.url, public_id: result.public_id };
        profile = {
          ...profile,
          image: file,
        };
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(req.body.password, salt);
        profile = {
          ...profile,
          password: hashedPw,
        };
      }
      await Accounts.findByIdAndUpdate({ _id: id }, profile);
      res.status(200).json("Update Profile Success");
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new AccountsController();
