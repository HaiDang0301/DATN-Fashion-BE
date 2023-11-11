const WareHouse = require("../../Models/WareHouse");
class StatisticalController {
  async getDate(req, res, next) {
    const year = req.query.year;
    let date = {};
    if (year) {
      date = { years: year };
    }
    try {
      const getDate = await WareHouse.find(date);
      res.status(200).json(getDate);
    } catch (error) {
      res.status(500).json("Connect Sever Errors");
    }
  }
  async index(req, res, next) {
    const year = req.query.year;
    const month = req.query.month;
    const type = req.query.type;
    let queryData = {
      years: new Date().getFullYear(),
      months: {
        $elemMatch: {
          month: new Date().getMonth() + 1,
        },
      },
    };
    if (year && month) {
      queryData = {
        years: year,
        months: {
          $elemMatch: {
            month: month,
          },
        },
      };
    }
    let dataDetails = {};
    let limit = 9;
    const paginate = (data, limit) => {
      const totalPages = Math.ceil(data.length / limit);
      const currentPage = req.query.page || 1;
      const paginatedData = data.slice(
        (currentPage - 1) * limit,
        currentPage * limit
      );
      return {
        data: paginatedData,
        totalPages,
      };
    };
    try {
      const dataWareHouse = await WareHouse.findOne(queryData);
      const findMonth = dataWareHouse.months.filter((data) => {
        return month
          ? data.month === `${month}`
          : data.month === `${new Date().getMonth() + 1}`;
      });
      findMonth.forEach((data) => {
        if (type === "import") {
          const type = data.data.filter((type) => {
            return type.type === 0;
          });
          dataDetails = type;
        }
        if (type === "sale") {
          const type = data.data.filter((type) => {
            return type.type === 1;
          });
          dataDetails = type;
        }
        if (!type) {
          dataDetails = data.data;
        }
      });
      const paginateData = paginate(dataDetails, limit);
      res
        .status(200)
        .json({ dataWareHouse, findMonth, paginateData, dataDetails });
    } catch (error) {
      console.log(error);
      res.status(500).json("Connect Server Errors");
    }
  }
}
module.exports = new StatisticalController();
