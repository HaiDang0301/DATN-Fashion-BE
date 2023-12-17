const Producers = require("../../Models/ProducersModel");
class ProducerController {
  async index(req, res, next) {
    const status = req.query.status;
    const page = req.query.page;
    const limit = 9;
    const countProducers = await Producers.countDocuments();
    let totalPage = Math.ceil(countProducers / limit);
    if (status) {
      if (status === "default") {
        var cateria = {};
      } else {
        cateria = { status: status };
        const countProducers = await Producers.find(cateria).countDocuments();
        totalPage = Math.ceil(countProducers / limit);
      }
    }
    try {
      const producers = await Producers.find(cateria)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: "desc" });
      res.json({ producers, totalPage, countProducers });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async store(req, res, next) {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const phone_number = req.body.phone_number;
      const findName = await Producers.findOne({ name: name });
      const findEmail = await Producers.findOne({ email: email });
      const findPhone = await Producers.findOne({ phone_number: phone_number });
      if (findName || findEmail || findPhone) {
        res.status(409).json("Producer has existed");
      } else {
        const producer = new Producers({
          name: req.body.name,
          phone_number: req.body.phone_number,
          email: req.body.email,
          address: req.body.address,
        });
        producer.save();
        res.status(200).json("Add Producer Success");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async edit(req, res, next) {
    try {
      const producer = await Producers.findById({ _id: req.params.id });
      if (producer) {
        res.status(200).json(producer);
      } else {
        res.status(404).json("Can't Find Producer");
      }
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
  async update(req, res, next) {
    try {
      const id = req.params.id;
      await Producers.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          name: req.body.name,
          phone_number: req.body.phone_number,
          email: req.body.email,
          address: req.body.address,
          status: req.body.status,
          contract_sign_date: Date.now(),
        }
      )
        .then((producer) => {
          res.status(200).json("Update Producer Success");
        })
        .catch((err) => {
          res.status(401).json("Can't Find Producer");
        });
    } catch (error) {
      res.status(500).json("Conenct Server False");
    }
  }
  async destroy(req, res, next) {
    const id = req.params.id;
    try {
      await Producers.findByIdAndDelete({ _id: id })
        .then((producer) => {
          res.status(200).json("Delete Producer Success");
        })
        .catch((err) => {
          res.status(401).json("Can't Find Producer");
        });
    } catch (error) {
      res.status(500).json("Connect Server False");
    }
  }
}
module.exports = new ProducerController();
