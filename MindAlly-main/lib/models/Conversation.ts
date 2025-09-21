import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
      model?: string;
      tokens?: number;
      latency?: number;
    };
  }[];
  context: {
    sessionId: string;
    lastActivity: Date;
    totalMessages: number;
    summary?: string; // Optional conversation summary for long chats
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      model: String,
      tokens: Number,
      latency: Number,
    },
  }],
  context: {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    totalMessages: {
      type: Number,
      default: 0,
    },
    summary: String,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
ConversationSchema.index({ userId: 1, 'context.sessionId': 1 });
ConversationSchema.index({ 'context.lastActivity': -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
