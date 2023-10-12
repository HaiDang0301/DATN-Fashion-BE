const Blogs = require("../../Models/BlogsModel");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
class BlogsController {
  async index(req, res, next) {
    let cateria = {};
    const limit = 12;
    const page = req.query.page;
    const countPage = await Blogs.countDocuments();
    let totalPage = Math.ceil(countPage / limit);
    const begin = req.query.begin;
    const final = req.query.final;
    if (begin && final) {
      cateria = {
        createdAt: { $gte: new Date(begin), $lte: new Date(final) },
      };
      const countPage = await Blogs.find(cateria).countDocuments();
      totalPage = Math.ceil(countPage / limit);
    }
    try {
      const blogs = await Blogs.find(cateria)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: "desc" });
      res.status(200).json({ blogs, totalPage });
    } catch (error) {
      res.status(500).json("Connect Sever False");
    }
  }
  async store(req, res, next) {
    try {
      const title = await Blogs.findOne({ title: req.body.title });
      if (title) {
        res.status(409).json("The Blogs Has Existed");
      } else {
        const fileUpload = req.files.image;
        const result = await cloudinary.uploader.upload(
          fileUpload.tempFilePath,
          { folder: "blogs" }
        );
        const blogs = await new Blogs({
          image: result.url,
          public_id: result.public_id,
          title: req.body.title,
          author: req.body.author,
          description: req.body.description,
        });
        blogs.save();
        res.status(200).json("Add Blog Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async edit(req, res, next) {
    try {
      const blog = await Blogs.findById({ _id: req.params.id });
      if (blog) {
        res.status(200).json(blog);
      } else {
        res.status(404).json("Can't Find Blogs");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const findBlogs = await Blogs.find({ _id: id });
      if (findBlogs.length < 1) {
        res.status(404).json("Can't Find Blog");
      } else {
        findBlogs.map(async (item, index) => {
          const image = req.files;
          if (image) {
            const destroy = await cloudinary.uploader.destroy(item.public_id);
            const result = await cloudinary.uploader.upload(
              image.image.tempFilePath,
              {
                folder: "blogs",
              }
            );
            const blogs = await Blogs.findByIdAndUpdate(
              { _id: id },
              {
                image: result.url,
                public_id: result.public_id,
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
              }
            );
            res.status(200).json("Update Blog Success");
          } else {
            const blogs = await Blogs.findByIdAndUpdate(
              { _id: id },
              {
                image: item.image,
                title: req.body.title,
                author: req.body.author,
                description: req.body.description,
              }
            );
            res.status(200).json("Update Blog Success");
          }
        });
      }
    } catch (error) {
      res.status(500).json("Conect Server False");
    }
  }
  async destroy(req, res, next) {
    try {
      const blog = await Blogs.find({ _id: req.params.id });
      blog.map(async (item, index) => {
        const destroy = await cloudinary.uploader.destroy(item.public_id);
        const id = await Blogs.findOneAndDelete({ _id: req.params.id });
        if (id) {
          res.status(200).json("Delete Blog Success");
        } else {
          res.status(404).json("Can't Find Blogs");
        }
      });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new BlogsController();
