const express = require("express");
const { requireSignin, adminMiddleware } = require("../common-middleware");
const {
  updateUser,
  getUsers,
  deleteUserById,
  disableUser,
  getDisabledUsers,
  enableUser,
} = require("../controllers/user");

const router = express.Router();

router.post("/update", requireSignin, updateUser);
router.get("/getUsers", getUsers);
router.get("/getDisable", getDisabledUsers);
router.post("/delete", requireSignin, adminMiddleware, deleteUserById);
router.post("/disabled", requireSignin, adminMiddleware, disableUser);
router.post("/enabled", requireSignin, adminMiddleware, enableUser);

module.exports = router;
