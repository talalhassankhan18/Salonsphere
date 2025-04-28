import mongoose, { Schema, model, Document } from "mongoose";

interface IVerificationToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expires: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  token: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expires: { type: Date, required: true },
});

export default mongoose.models.VerificationToken || model<IVerificationToken>("VerificationToken", VerificationTokenSchema);