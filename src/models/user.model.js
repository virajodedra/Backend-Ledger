import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const validEmail = function (email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validPassword = function (password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  return passwordRegex.test(password);
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating an account"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: validEmail,
        message: "Please fill a valid email address",
      },
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required for creating an account"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: validPassword,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      },
      select: false, // Exclude password from query results by default
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false, 
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }

  const hash = await bcrypt.hash(
    this.password,
    parseInt(process.env.SALT_ROUNDS) || 10,
  );
  this.password = hash;

  return;
});

/**
 * @typedef {import("mongoose").Document & {
 *   email: string,
 *   name: string,
 *   password: string,
 *   comparePassword(password: string): Promise<boolean>
 * }} UserDocument
 */

/**
 * Compare the provided password with the hashed password stored in the database
 * @param {string} password - The plain text password to compare
 * @returns {Promise<boolean>} Returns true if the passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;
