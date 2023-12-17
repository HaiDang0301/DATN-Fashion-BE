const Sizes = require("../../Models/SizesModel");
class SizeController {
  async index(req, res, next) {
    const sizes = await Sizes.find({});
    res.status(200).json(sizes);
  }
  async store(req, res, next) {
    try {
      const size = req.body.sizes;
      const findSize = await Sizes.findOne({ sizes: size });
      if (findSize) {
        res.status(409).json("Size has existed");
      } else {
        const size = new Sizes({
          sizes: req.body.sizes,
        });
        size.save();
        res.status(200).json("Add Size Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const findId = await Sizes.findById({ _id: id });
      if (findId) {
        const size = await Sizes.findByIdAndUpdate(
          {
            _id: id,
          },
          { sizes: req.body.sizes }
        );
        res.status(200).json("Update Size Success");
      } else {
        res.status(404).json("No Size Found");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async destroy(req, res, next) {
    try {
      const id = req.params.id;
      const findId = await Sizes.findById({ _id: id });
      if (findId) {
        await Sizes.findByIdAndDelete({ _id: id });
        res.status(200).json("Delete Size Success");
      } else {
        res.status(404).json("No Size Found");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new SizeController();
