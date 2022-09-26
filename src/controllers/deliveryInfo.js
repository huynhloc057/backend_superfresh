const { DeliveryInfo } = require("../models");

exports.addDeliveryInfo = async (req, res) => {
  const { address } = req.body;
  try {
    var updatedAddress;
    if (address._id) {
      updatedAddress = await DeliveryInfo.findOneAndUpdate(
        { user: req.user._id, "address._id": address._id },
        {
          $set: {
            "address.$": address,
          },
        }
      );
    } else {
      updatedAddress = await DeliveryInfo.findOneAndUpdate(
        { user: req.user._id },
        {
          $push: {
            address,
          },
        },
        { new: true, upsert: true }
      );
    }
    if (updatedAddress) {
      res.status(201).json({ address: updatedAddress });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteDeliveryInfo = (req, res) => {
  const { addressId } = req.body;
  if (addressId) {
    DeliveryInfo.findOneAndUpdate(
      { user: req.user._id },
      {
        $pull: {
          address: {
            _id: addressId,
          },
        },
      },
      { new: true, upsert: true }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      } else {
        res.status(400).json({ error: "something went wrong" });
      }
    });
  } else {
    res.status(400).json({ error: "Params address required" });
  }
};

exports.setDefaultDeliveryInfo = (req, res) => {
  const { addressId } = req.body;
  if (addressId) {
    DeliveryInfo.updateOne(
      { user: req.user._id },
      {
        $set: {
          "address.$[].isDefault": false,
        },
      }
    ).exec((done, error) => {
      DeliveryInfo.findOneAndUpdate(
        { user: req.user._id, "address._id": addressId },
        {
          $set: {
            "address.$.isDefault": true,
          },
        }
      ).exec((error, result) => {
        if (error) return res.status(400).json({ error });
        if (result) {
          res.status(201).json({ result: "Set Default successful" });
        } else {
          res.status(400).json({ error: "something went wrong" });
        }
      });
    });
  } else {
    res.status(400).json({ error: "Params address required" });
  }
};

exports.getDeliveryInfo = (req, res) => {
  DeliveryInfo.findOne({ user: req.user._id })
    .populate("user", "_id name profilePicture")
    .exec((error, deliveryInfo) => {
      if (error) return res.status(400).json({ error });
      if (deliveryInfo) {
        res.status(200).json({ deliveryInfo });
      } else {
        res.status(200).json({ deliveryInfo: {} });
      }
    });
};
