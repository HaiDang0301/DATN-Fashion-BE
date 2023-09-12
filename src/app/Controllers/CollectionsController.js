const Collection = require("../Models/CollectionsModel");
class CollectionController {
  async show(req, res, next) {
    const collection = await Collection.find({});
    res.json(collection);
  }
  async store(req, res, next) {
    try {
      const find = await Collection.findOne({
        collections: req.body.collections,
      });
      if (!find) {
        const collection = await new Collection({
          collections: req.body.collections,
          categories: {
            name: req.body.name,
          },
        });
        collection.save();
        res.json(collection);
      } else {
        const collection = await Collection.findOneAndUpdate(
          {
            collections: req.body.collections,
          },
          {
            $push: {
              categories: {
                name: req.body.name,
              },
            },
          }
        );
        res.json(collection);
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    const collection = req.body.collections;
    try {
      if (collection) {
        const findCollection = await Collection.findOneAndUpdate(
          { _id: req.params.id },
          {
            collections: req.body.collections,
          }
        );
        res.status(200).json("Update Collection Success");
      } else {
        const category = await Collection.updateOne(
          {
            _id: req.params.id,
            "categories._id": req.body.idc,
          },
          { $set: { "categories.$.name": req.body.name } }
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
      if (collection) {
        const findCollection = await Collection.findOneAndDelete({
          _id: req.params.id,
        });
        res.status(200).json("Delete Collection Success");
      } else {
        const category = await Collection.findByIdAndUpdate(
          {
            _id: req.params.id,
          },
          { $pull: { "categories": { _id: req.body.idc } } }
        );
        res.status(200).json("Delete Category Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new CollectionController();
