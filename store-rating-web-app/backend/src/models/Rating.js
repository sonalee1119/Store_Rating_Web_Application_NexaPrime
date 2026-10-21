import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number between 1 and 5'
      }
    },
    comment: {
      type: String,
      maxlength: 300,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

ratingSchema.index({ storeId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
