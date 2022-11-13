const { Order, DeliveryInfo } = require("../models");
const crypto = require("crypto");
const https = require("https");

exports.addOrder = (req, res) => {
  const { items, addressId, totalAmount, paymentStatus, paymentType } =
    req.body;
  const orderStatus = [
    {
      type: "ordered",
      date: new Date(),
      isCompleted: true,
    },
    {
      type: "packed",
      isCompleted: false,
    },
    {
      type: "shipped",
      isCompleted: false,
    },
    {
      type: "delivered",
      isCompleted: false,
    },
  ];

  const order = new Order({
    user: req.user._id,
    addressId,
    totalAmount,
    items,
    paymentStatus,
    paymentType,
    orderStatus,
  });
  order.save((error, order) => {
    if (error) return res.status(400).json({ error });
    if (order) {
      res.status(201).json({ order });
    }
  });
};

exports.getOrder = (req, res) => {
  const { orderId } = req.body;
  Order.findOne({ _id: orderId })
    .populate("items.product", "_id name slug price productPictures")
    .lean()
    .exec((error, order) => {
      if (error) return res.status(400).json({ error });
      if (order) {
        DeliveryInfo.findOne({ user: req.user._id }).exec((error, dI) => {
          if (error) return res.status(400).json({ error });
          order.address = dI.address.find(
            (address) => address._id == order.address
          );
          res.status(200).json({ order });
        });
      }
    });
};

exports.updateStatus = (req, res) => {
  const { orderId, type } = req.body;
  if (req.user.role === "admin") {
    Order.findOneAndUpdate(
      { _id: orderId, "orderStatus.type": type },
      {
        $set: {
          "orderStatus.$": [{ type, date: new Date(), isCompleted: true }],
        },
      }
    ).exec((error, order) => {
      if (error) return res.status(400).json({ error });
      if (order) {
        res.status(202).json({ order });
      } else {
        res.status(400).json({ error: "something went wrong" });
      }
    });
  } else {
    Order.findOneAndUpdate({ _id: orderId }, { paymentStatus: type }).exec(
      (error, order) => {
        if (error) return res.status(400).json({ error });
        if (order) {
          res.status(202).json({ order });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      }
    );
  }
};

//User
exports.getAllOrders = async (req, res) => {
  Order.find({ user: req.user._id })
    .populate("items.productId", "_id name slug price  productPictures")
    .sort({ createdAt: -1 })
    .exec((error, orders) => {
      if (error) return res.status(400).json({ error });
      if (orders) {
        return res.status(200).json({ orders });
      }
      res.status(400).json({ error: "something went wrong" });
    });
};

//Admin
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: { $ne: "cancelled" } })
      .populate("items.productId", "_id name slug price  productPictures")
      .sort({ createdAt: -1 })
      .exec();
    res.status(200).json({ orders });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//Sau khi charge thì mới add vào db
exports.addOrderByPaymentMomo = (req, res) => {
  const { extraData } = req.body;
  const data = JSON.parse(extraData.substring(0, extraData.length - 1));
  const { userId, items, addressId, totalAmount, paymentStatus, paymentType } =
    data;
  const orderStatus = [
    {
      type: "ordered",
      date: new Date(),
      isCompleted: true,
    },
    {
      type: "packed",
      isCompleted: false,
    },
    {
      type: "shipped",
      isCompleted: false,
    },
    {
      type: "delivered",
      isCompleted: false,
    },
  ];

  const order = new Order({
    user: userId,
    addressId,
    totalAmount,
    items,
    paymentStatus,
    paymentType,
    orderStatus,
  });
  order.save((error, order) => {
    if (error) return res.status(400).json({ error });
    if (order) {
      res.status(201).json({ order });
    }
  });
};

//Bước 1 của thanh toán momo
exports.paymentWithMomo = async (req, res) => {
  const { order } = req.body;
  const partnerCode = "MOMO6K0Y20210317";
  const accessKey = "8oZLaYOOTAswDt0O";
  const secretkey = "MHxk2u6eOXitCarGbCsGXmpydjn0wCAk";
  const requestId = partnerCode + new Date().getTime();
  const orderId = requestId;
  const orderInfo = "Thanh toán rau củ tại Super Fresh";
  const redirectUrl = "https://client-superfresh.vercel.app/cart";
  const ipnUrl =
    "https://apisuperfreshute.herokuapp.com/api/order/addOrderByPaymentMomo";
  const amount = order.totalAmount;
  const requestType = "captureWallet";
  const extraData = JSON.stringify({ ...order, userId: req.user._id }) + "@"; //pass empty value if your merchant does not have stores
  const rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  const signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");
  //json object send to MoMo endpoint
  const body = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    orderObj: order,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };
  const request = await https.request(options, (resp) => {
    resp.setEncoding("utf8");
    resp.on("data", (body) => {
      res.status(200).json({ url: JSON.parse(body).payUrl });
    });
    resp.on("end", () => {
      console.log("No more data in response.");
    });
  });

  request.write(body);
  request.end();
};
