const jwt = require("jsonwebtoken");
const redis = require("redis");

const client = redis.createClient({
  host: "redis",
  legacyMode: true,
});
const createError = require("http-errors");

// const client = redis.createClient()

exports.generateAccessToken = ({ _id, email, role }) => {
  return jwt.sign({ _id, email, role }, process.env.JWT_SECRET, {
    expiresIn: "60s",
  });
};
exports.generateRefreshToken = async ({ _id, email, role }) => {
  return new Promise((resolve, reject) => {
    const payload = { _id, role, email };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const option = {
      expiresIn: "30d",
    };
    const token = jwt.sign(payload, secret, option);
    //refresh token valid in 30 days
    client.set(_id.toString(), token, "EX", 30 * 24 * 60 * 60, (err, reply) => {
      if (err) {
        return reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};
exports.verifyRefreshToken = async (token) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        reject(error.message);
      }
      client.get(decoded._id.toString(), async (error, result) => {
        if (error) {
          reject(error);
        }
        if (!result) {
          reject("Refresh token expired");
        }
        if (result) {
          const payload = { _id: decoded._id, role: decoded.role };
          const newAccessToken = await generateAccessToken(payload);
          resolve(newAccessToken);
        }
      });
    });
  });
};

exports.deleteRefreshToken = async (id) => {
  return new Promise((resolve, reject) => {
    client.del(id, (error, reply) => {
      if (error) {
        reject(error);
      }
      resolve(true);
    });
  });
};
