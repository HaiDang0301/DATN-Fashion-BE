const Blogs = require("../../Models/BlogsModel");
class BlogsUserController {
  async index(req, res, next) {
    let cateria = {};
    const limit = 6;
    const page = req.query.page;
    const countPage = await Blogs.countDocuments();
    let totalPage = Math.ceil(countPage / limit);
    const author = req.query.author;
    const hashtag = req.query.hashtag;
    if (author) {
      cateria = { author: { $regex: author } };
      const countPage = await Blogs.find(cateria).countDocuments();
      totalPage = Math.ceil(countPage / limit);
    }
    if (hashtag) {
      cateria = { title: { $regex: hashtag } };
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
  async show(req, res, next) {
    const slug = req.params.slug;
    const blog = await Blogs.findOne({ slug: slug });
    try {
      if (blog) {
        res.status(200).json(blog);
      } else res.status(404).json("Can't Find Blogs");
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new BlogsUserController();
