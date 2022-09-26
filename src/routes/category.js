const express = require("express");
const {
  addCategory,
  getCategories,
  updateCategories,
  deleteCategoryById,
  getDisabledCategories,
  enableCategoryById,
} = require("../controllers/category");
const { requireSignin, adminMiddleware } = require("../common-middleware");

const router = express.Router();

router.post("/add", requireSignin, adminMiddleware, addCategory);
router.get("/getCategories", getCategories);
router.get("/getDisableCategories", getDisabledCategories);
router.post("/delete", requireSignin, adminMiddleware, deleteCategoryById);
router.post("/enable", requireSignin, adminMiddleware, enableCategoryById);

router.post("/update", requireSignin, adminMiddleware, updateCategories);

module.exports = router;
