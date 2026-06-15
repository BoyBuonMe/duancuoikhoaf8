import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin" | "boss";
export type UserStatus = "active" | "blocked";

// Định nghĩa type cho document
interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name: string;
  phone: string;
  tell?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  authProvider: "local" | "google";
  googleId?: string;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  comparePassword(plain: string): Promise<boolean>;
}

// Định nghĩa type cho static methods
interface IUserModel extends Model<IUser> {
  hashPassword(plain: string): Promise<string>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, select: false },
    name: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    tell: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["user", "admin", "boss"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    emailVerified: { type: Boolean, default: false },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String, trim: true, select: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
  },
  { timestamps: true, collection: "users" },
);

userSchema.index({ email: 1 }, { unique: true, name: "users_email_unique" });
userSchema.index(
  { googleId: 1 },
  { unique: true, sparse: true, name: "users_googleId_unique_sparse" },
);
userSchema.index(
  { emailVerificationTokenHash: 1 },
  { name: "users_emailVerificationTokenHash_sparse", sparse: true },
);
userSchema.index(
  { passwordResetTokenHash: 1 },
  { name: "users_passwordResetTokenHash_sparse", sparse: true },
);

// Instance method
userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

// Static method
userSchema.statics.hashPassword = async function (plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
