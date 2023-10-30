const Banners = require("../../Models/BannersModel");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
class BannerController {
  async index(req, res, next) {
    let cateria = {};
    const limit = 12;
    const page = req.query.page;
    const countPage = await Banners.countDocuments();
    let totalPage = Math.ceil(countPage / limit);
    const begin = req.query.begin;
    const final = req.query.final;
    if (begin && final) {
      cateria = {
        createdAt: { $gte: new Date(begin), $lte: new Date(final) },
      };
      const countPage = await Banners.find(cateria).countDocuments();
      totalPage = Math.ceil(countPage / limit);
    }
    try {
      const banners = await Banners.find(cateria)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: "desc" });
      res.status(200).json({ banners, totalPage });
    } catch (error) {
      res.status(500).json("Connect Sever False");
    }
  }
  async store(req, res, next) {
    try {
      const title = await Banners.findOne({ title: req.body.title });
      if (title) {
        res.status(409).json("The Banners Has Existed");
      } else {
        const fileUpload = req.files.image;
        const result = await cloudinary.uploader.upload(
          fileUpload.tempFilePath,
          { folder: "banners" }
        );
        const banners = await new Banners({
          image: result.url,
          public_id: result.public_id,
          title: req.body.title,
          description: req.body.description,
        });
        banners.save();
        res.status(200).json("Add Banner Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async edit(req, res, next) {
    try {
      const banner = await Banners.findById({ _id: req.params.id });
      if (banner) {
        res.status(200).json(banner);
      } else {
        res.status(404).json("Can't Find Banners");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const findBanners = await Banners.find({ _id: id });
      if (findBanners.length < 1) {
        res.status(404).json("Can't Find Blog");
      } else {
        findBanners.map(async (item, index) => {
          const image = req.files;
          if (image) {
            const destroy = await cloudinary.uploader.destroy(item.public_id);
            const result = await cloudinary.uploader.upload(
              image.image.tempFilePath,
              {
                folder: "banners",
              }
            );
            await Banners.findByIdAndUpdate(
              { _id: id },
              {
                image: result.url,
                public_id: result.public_id,
                title: req.body.title,
                description: req.body.description,
              }
            );
            res.status(200).json("Update Banner Success");
          } else {
            const banners = await Banners.findByIdAndUpdate(
              { _id: id },
              {
                image: item.image,
                title: req.body.title,
                description: req.body.description,
              }
            );
            res.status(200).json("Update Banner Success");
          }
        });
      }
    } catch (error) {
      res.status(500).json("Conect Server False");
    }
  }
  async destroy(req, res, next) {
    try {
      const banner = await Banners.find({ _id: req.params.id });
      banner.map(async (item, index) => {
        await cloudinary.uploader.destroy(item.public_id);
        const id = await Banners.findOneAndDelete({ _id: req.params.id });
        if (id) {
          res.status(200).json("Delete Banner Success");
        } else {
          res.status(404).json("Can't Find Banners");
        }
      });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new BannerController();
