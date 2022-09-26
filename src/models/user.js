const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    profilePicture: {
      type: String,
      default:
        "https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png",
    },

    isDisabled: false,
  },
  { timestamps: true }
);

userSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
};
module.exports = mongoose.model("User", userSchema);
