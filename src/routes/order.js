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
  paymentWithPaypal,
} = require("../controllers/order");

const router = express.Router();

router.post("/add", requireSignin, userMiddleware, addOrder);
router.post("/order/addOrderByPaymentMomo", addOrderByPaymentMomo);
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
router.post(
  "/paymentWithPaypal",
  requireSignin,
  userMiddleware,
  paymentWithPaypal
);

module.exports = router;
