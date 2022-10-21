const express = require("express");
const env = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const paypal = require("./config/paypal");

env.config();
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.eo02fim.mongodb.net/test?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database connected");
  });

paypal.connect(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

app.use(cors());
app.use(express.json());

require("./models");
app.use("/api", routes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
