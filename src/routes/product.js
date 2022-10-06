const express = require("express");
const {
  addProduct,
  getProductById,
  getProductDetailsBySlug,
  deleteProductById,
  getProducts,
  updateProduct,
  searchByProductName,
  getProductByCategory,
  addProductReview,
} = require("../controllers/product");
const {
  requireSignin,
  adminMiddleware,
  userMiddleware,
  uploadCloud,
} = require("../common-middleware");
const router = express.Router();

router.post(
  "/add",
  requireSignin,
  adminMiddleware,
  uploadCloud.array("productPicture"),
  addProduct
);
router.post("/getProducts", getProducts);
router.post("/:slug", getProductDetailsBySlug);
router.post("/searchByProductName", searchByProductName);
router.post("/getById", getProductById);
router.delete(
  "/deleteProductById",
  requireSignin,
  adminMiddleware,
  deleteProductById
);
router.post("/update", requireSignin, adminMiddleware, updateProduct);
router.post(
  "/addProductReview",
  requireSignin,
  userMiddleware,
  addProductReview
);
router.post("/getProductsByCategory/:_id", getProductByCategory);

module.exports = router;
