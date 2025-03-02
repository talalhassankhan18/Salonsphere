import mongoose, { Schema, Document, Model, CallbackError } from "mongoose";
import bcrypt from "bcryptjs";

export interface User extends Document {
  email: string;
  password: string;
  role: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema<User> = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "vendor", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const User: Model<User> = mongoose.models.User || mongoose.model<User>("User", UserSchema);
export default User;
