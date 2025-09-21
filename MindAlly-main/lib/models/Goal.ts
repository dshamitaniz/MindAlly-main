import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  userId: string;
  title: string;
  description?: string;
  category: 'health' | 'career' | 'personal' | 'relationships' | 'learning' | 'other';
  type: 'habit' | 'task' | 'milestone' | 'challenge';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['health', 'career', 'personal', 'relationships', 'learning', 'other'],
    required: true,
  },
  type: {
    type: String,
    enum: ['habit', 'task', 'milestone', 'challenge'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'not-started',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  dueDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });
GoalSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
