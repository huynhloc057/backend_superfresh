const express = require("express");
const {
  addCategory,
  getCategories,
  updateCategories,
  deleteCategoryById,
  getDisabledCategories,
  enableCategoryById,
  getCategoryById,
} = require("../controllers/category");
const {
  requireSignin,
  adminMiddleware,
  uploadCloud,
} = require("../common-middleware");

const router = express.Router();

router.post(
  "/add",
  requireSignin,
  adminMiddleware,
  uploadCloud.single("categoryImage"),
  addCategory
);
router.get("/getCategories", getCategories);
router.post("/getCateById", getCategoryById);
router.get("/getDisableCategories", getDisabledCategories);
router.post("/delete", requireSignin, adminMiddleware, deleteCategoryById);
router.post("/enable", requireSignin, adminMiddleware, enableCategoryById);

router.post("/update", requireSignin, adminMiddleware, updateCategories);

module.exports = router;
