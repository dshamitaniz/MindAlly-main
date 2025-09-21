import mongoose, { Schema, Document } from 'mongoose';

export interface ITherapist extends Document {
  name: string;
  email: string;
  phone: string;
  credentials: string[];
  specialties: string[];
  bio: string;
  photo?: string;
  location: {
    city: string;
    state: string;
    country: string;
    online: boolean;
  };
  availability: {
    days: string[];
    hours: string;
    timezone: string;
  };
  insurance: string[];
  languages: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

const TherapistSchema = new Schema<ITherapist>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  credentials: [{
    type: String,
  }],
  specialties: [{
    type: String,
  }],
  bio: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  location: {
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    online: {
      type: Boolean,
      default: false,
    },
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    hours: {
      type: String,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  insurance: [{
    type: String,
  }],
  languages: [{
    type: String,
  }],
  verified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Index for efficient queries
TherapistSchema.index({ 'location.city': 1, 'location.state': 1 });
TherapistSchema.index({ specialties: 1 });
TherapistSchema.index({ verified: 1, rating: -1 });

export default mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', TherapistSchema);
