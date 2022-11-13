const Product = require("../models/product");
const Order = require("../models/order");

exports.statisticRevenue = async (req, res) => {
  const { type } = req.body;
  const dateFrom = new Date(req.body.dateFrom);
  const dateTo = new Date(req.body.dateTo);
  var step = -1; //Type param is invalid
  // if type === day, getting by yyyy-mm-dd format
  if (type == "day") {
    step = 10;
  } else if (type == "month") {
    step = 7;
  } else if (type == "year") {
    step = 4;
  }
  if (step === -1) {
    return res.status(400).json({ error: "Type param is invalid" });
  }
  try {
    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFrom, $lte: dateTo },
          paymentStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $substr: ["$createdAt", 0, step],
          },
          total: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalAmount: "$total",
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    if (revenue) {
      return res.status(200).json({ revenue });
    }
    res.status(400).json({ error: "something went wrong" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
