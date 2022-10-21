const paypal = require("paypal-rest-sdk");
async function connect(id, secret) {
  try {
    await paypal.configure({
      mode: "sandbox",
      client_id: id,
      client_secret: secret,
    });
    console.log("Success Paypal");
  } catch (error) {
    console.log(error);
    console.log("connect Paypal fail!!");
  }
}
module.exports = { connect };
