const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const shortid = require("shortid");

require("dotenv").config();
// image upload to cloudinary storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png"],
  filename: function (req, file, cb) {
    cb(null, file.originalname + "-" + shortid.generate());
  },
});

exports.uploadCloud = multer({ storage });

exports.requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // decode token de lay User theo cai secret key
      const user = jwt.verify(token, process.env.JWT_SECRET);
      // luu user vao request
      console.log(user);
      req.user = user;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(400).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Authorization required" });
  }
  next();
};

exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ message: "User access denied" });
  }
  next();
};
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(400).json({ message: "Admin access denied" });
  }
  next();
};
