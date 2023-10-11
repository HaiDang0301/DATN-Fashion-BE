const Collections = require("../../Models/CollectionsModel");
class CollectionController {
  async show(req, res, next) {
    const collection = req.query.collection;
    let cateria = {};
    if (collection) {
      cateria = { collections: collection };
    }
    try {
      const collections = await Collections.find(cateria);
      res.status(200).json(collections);
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async store(req, res, next) {
    try {
      const find = await Collections.findOne({
        collections: req.body.collections,
      });
      if (!find) {
        const collection = new Collections({
          collections: req.body.collections,
        });
        collection.save();
        res.status(200).json("Add Collection Success");
      } else {
        await Collections.findOneAndUpdate(
          {
            collections: req.body.collections,
            "categories.category": { $ne: req.body.category },
          },
          {
            $addToSet: {
              categories: {
                category: req.body.category,
              },
            },
          }
        );
        res.status(200).json("Add Category Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    const collection = req.body.collections;
    try {
      if (collection) {
        const findCollection = await Collections.findOneAndUpdate(
          { _id: req.params.id },
          {
            collections: req.body.collections,
          }
        );
        res.status(200).json("Update Collection Success");
      } else {
        const category = await Collections.updateOne(
          {
            _id: req.params.id,
            "categories._id": req.body.idc,
          },
          { $set: { "categories.$.category": req.body.category } }
        );
        res.status(200).json("Update category success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async destroy(req, res, next) {
    const collection = req.body.collections;
    try {
      if (!collection) {
        const findCollection = await Collections.findOneAndDelete({
          _id: req.params.id,
        });
        res.status(200).json("Delete Collection Success");
      } else {
        const category = await Collections.findByIdAndUpdate(
          {
            _id: req.params.id,
          },
          { $pull: { categories: { _id: req.body.id } } }
        );
        res.status(200).json("Delete Category Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new CollectionController();
