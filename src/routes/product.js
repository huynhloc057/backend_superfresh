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
  deleteProductByCateId,
  enableProductByCateId,
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
router.post(
  "/addProductReview",
  requireSignin,
  userMiddleware,
  addProductReview
);
router.post("/getById", getProductById);
router.post("/update", requireSignin, adminMiddleware, updateProduct);
router.post("/searchByProductName", searchByProductName);
router.post("/getProductsByCategory/:categoryId", getProductByCategory);
router.post(
  "/deleteByCategory",
  requireSignin,
  adminMiddleware,
  deleteProductByCateId
);
router.post(
  "/enableByCategory",
  requireSignin,
  adminMiddleware,
  enableProductByCateId
);

router.post("/:slug", getProductDetailsBySlug);
router.delete(
  "/deleteProductById",
  requireSignin,
  adminMiddleware,
  deleteProductById
);

module.exports = router;
