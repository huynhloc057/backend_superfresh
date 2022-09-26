const express = require("express");
const authRoutes = require("./auth");
const categoryRoutes = require("./category");
const productRoutes = require("./product");
const userRoutes = require("./user");
const deliveryInfoRoutes = require("./deliveryInfo");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/category", categoryRoutes);
router.use("/product", productRoutes);
router.use("/user", userRoutes);
router.use("/deliveryInfo", deliveryInfoRoutes);

module.exports = router;
