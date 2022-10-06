const express = require("express");
const {
  signup,
  signin,
  signinWithGoogle,
  isUserLoggedIn,
  signout,
} = require("../controllers/auth");
const { requireSignin } = require("../common-middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signin/google", signinWithGoogle);
router.post("/isUserLoggedIn", requireSignin, isUserLoggedIn);
router.post("/signout", signout);

module.exports = router;
