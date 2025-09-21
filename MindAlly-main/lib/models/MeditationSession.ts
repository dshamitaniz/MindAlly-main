import mongoose, { Schema, Document } from 'mongoose';

export interface IMeditationSession extends Document {
  userId: string;
  type: 'breathing' | 'body-scan' | 'progressive-relaxation' | 'concentration' | 'sleep-story';
  duration: number; // in minutes
  completed: boolean;
  timestamp: Date;
}

const MeditationSessionSchema = new Schema<IMeditationSession>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['breathing', 'body-scan', 'progressive-relaxation', 'concentration', 'sleep-story'],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// Index for efficient queries
MeditationSessionSchema.index({ userId: 1, timestamp: -1 });
MeditationSessionSchema.index({ userId: 1, type: 1 });

export default mongoose.models.MeditationSession || mongoose.model<IMeditationSession>('MeditationSession', MeditationSessionSchema);
