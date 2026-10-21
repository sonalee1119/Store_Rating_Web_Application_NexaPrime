import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      maxlength: [100, 'Store name cannot exceed 100 characters'],
      trim: true
    },
    category: {
      type: String,
      default: 'Retail & Essentials',
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Store address is required'],
      maxlength: [400, 'Store address cannot exceed 400 characters'],
      trim: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model('Store', storeSchema);
