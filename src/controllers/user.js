const { User } = require("../models");
const bcrypt = require("bcrypt");

exports.getUsers = (req, res) => {
  User.find({ isDisabled: { $ne: true }, role: { $ne: "admin" } }).exec(
    (error, users) => {
      if (error) {
        return res.status(400).json({ error });
      }
      if (users) {
        return res.status(200).json({ users });
      } else {
        return res.status(400).json({ error: "something went wrong" });
      }
    }
  );
};

exports.getDisabledUsers = (req, res) => {
  User.find({ isDisabled: { $eq: true }, role: { $ne: "admin" } }).exec(
    (error, users) => {
      if (error) {
        return res.status(400).json({ error });
      }
      if (users) {
        return res.status(200).json({ users });
      } else {
        return res.status(400).json({ error: "something went wrong" });
      }
    }
  );
};

exports.updateUser = async (req, res) => {
  const user = { ...req.body };
  console.log(user);
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { ...user }
    );
    if (updatedUser) {
      res.status(202).json({ message: "updated successfully" });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.disableUser = async (req, res) => {
  const user = { ...req.body };
  try {
    const updatedUser = await User.updateOne(
      { _id: user._id },
      { $set: { isDisabled: true } }
    );
    if (updatedUser) {
      res.status(202).json({ message: "disabled successfully" });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.enableUser = async (req, res) => {
  const user = { ...req.body };
  try {
    const updatedUser = await User.updateOne(
      { _id: user._id },
      { $set: { isDisabled: false } }
    );
    if (updatedUser) {
      res.status(202).json({ message: "enabled user successfully" });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteUserById = (req, res) => {
  const { _id } = req.body.payload;
  User.findOneAndDelete({ _id }).exec((error, result) => {
    if (error) return res.status(400).json({ error });
    if (result) {
      res.status(204).json({ message: "deleted successfully" });
    } else {
      res.status(400).json({ error: "something went wrong" });
    }
  });
};
