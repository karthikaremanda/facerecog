import mongoose from 'mongoose';

export interface IAnalysis extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'face' | 'group' | 'crowd';
  imageUrl: string;
  results: any;
  createdAt: Date;
}

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['face', 'group', 'crowd'],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

export const Analysis = mongoose.model<IAnalysis>('Analysis', analysisSchema);
