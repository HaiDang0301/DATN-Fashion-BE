const Colors = require("../../Models/ColorsModel");
class ColorController {
  async index(req, res, next) {
    const colors = await Colors.find({});
    res.status(200).json(colors);
  }
  async store(req, res, next) {
    try {
      const color = req.body.colors;
      const findColor = await Colors.findOne({ color: color });
      if (findColor) {
        res.status(401).json("Color has existed");
      } else {
        const color = new Colors({
          colors: req.body.colors,
        });
        color.save();
        res.status(200).json("Add Color Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    try {
      const id = req.params.id;
      const findId = await Colors.findById({ _id: id });
      if (findId) {
        const color = await Colors.findByIdAndUpdate(
          {
            _id: id,
          },
          { colors: req.body.colors }
        );
        res.status(200).json("Update Color Success");
      } else {
        res.status(404).json("No Color Found");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async destroy(req, res, next) {
    try {
      const id = req.params.id;
      const findId = await Colors.findById({ _id: id });
      if (findId) {
        await Colors.findByIdAndDelete({ _id: id });
        res.status(200).json("Delete Color Success");
      } else {
        res.status(404).json("No Color Found");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new ColorController();


























