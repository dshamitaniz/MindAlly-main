import mongoose, { Schema, Document } from 'mongoose';

export interface IMoodEntry extends Document {
  userId: string;
  mood: 1 | 2 | 3 | 4 | 5;
  activities: string[];
  notes?: string;
  tags: string[];
  createdAt: Date;
}

const MoodEntrySchema = new Schema<IMoodEntry>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  activities: [{
    type: String,
  }],
  notes: {
    type: String,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Index for efficient queries
MoodEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.MoodEntry || mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);
