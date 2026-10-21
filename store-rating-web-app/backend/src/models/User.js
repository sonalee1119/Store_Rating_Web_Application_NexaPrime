import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [400, 'Address cannot exceed 400 characters'],
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'owner'],
      default: 'user'
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
