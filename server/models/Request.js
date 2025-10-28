import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  date: String,
  shift: String,
  reason: String,
  instructorId: String,
  instructorName: String,
  managerId: String,
  managerName: String,
  status: { type: String, default: 'pending' },
  imageUrl: String,
  handledBy: String,
  handledAt: Date
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
