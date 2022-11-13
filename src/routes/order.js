const express = require("express");
const {
  requireSignin,
  userMiddleware,
  adminMiddleware,
} = require("../common-middleware");
const {
  addOrder,
  getAllOrders,
  getOrder,
  updateStatus,
  getCustomerOrders,
  addOrderByPaymentMomo,
  paymentWithMomo,
} = require("../controllers/order");

const router = express.Router();

router.post("/add", requireSignin, userMiddleware, addOrder);
router.post("/addOrderByPaymentMomo", addOrderByPaymentMomo);
router.post("/getOrder", requireSignin, userMiddleware, getOrder);
router.post("/getOrders", requireSignin, userMiddleware, getAllOrders);
router.post("/updateType", requireSignin, updateStatus);
router.post(
  "/getCustomerOrders",
  requireSignin,
  adminMiddleware,
  getCustomerOrders
);
router.post("/paymentWithMomo", requireSignin, userMiddleware, paymentWithMomo);

module.exports = router;
