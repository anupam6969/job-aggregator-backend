import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false //  hide password by default
    },
     role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
   banned: {
    type: Boolean,
    default: false
  }
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);