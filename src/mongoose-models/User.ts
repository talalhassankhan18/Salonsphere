import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'salon_owner' | 'customer';
  registrationStatus: 'started' | 'completed';
  emailVerified: boolean;
  salon?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['admin', 'salon_owner', 'customer'],
      default: 'salon_owner',
    },
    registrationStatus: {
      type: String,
      enum: ['started', 'completed'],
      default: 'started',
    },
    emailVerified: { type: Boolean, default: false },
    salon: { type: Schema.Types.ObjectId, ref: 'Salon' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password || '');
};

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;