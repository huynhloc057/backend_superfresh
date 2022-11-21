const { verifyRefreshToken } = require("../services/token");
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const newAccessToken = await verifyRefreshToken(refreshToken);
    res.status(200).json({ newAccessToken });
  } catch (error) {
    res.status(400).json({ error });
  }
};
