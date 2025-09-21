import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  userId: string;
  type: 'phq9' | 'gad7' | 'rse' | 'spin' | 'ocir' | 'mbi' | 'npi16';
  responses: number[];
  score: number;
  interpretation: string;
  recommendations: string[];
  completedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['phq9', 'gad7', 'rse', 'spin', 'ocir', 'mbi', 'npi16'],
    required: true,
  },
  responses: [{
    type: Number,
    required: true,
  }],
  score: {
    type: Number,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  recommendations: [{
    type: String,
  }],
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// Index for efficient queries
AssessmentSchema.index({ userId: 1, type: 1, completedAt: -1 });

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
