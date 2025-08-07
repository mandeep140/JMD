import mongoose from 'mongoose';

const ChangeHistorySchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
    default: 'Ad'
  },
  entityId: {
    type: String,
    required: true
  },
  entityCode: {
    type: String, // Media code for ads
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE']
  },
  changedBy: {
    userId: {
      type: String, // Keep as string to avoid ObjectId issues
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    }
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }],
  summary: {
    type: String,
    required: true // Human readable summary
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
});

// Index for better query performance
ChangeHistorySchema.index({ entityType: 1, entityCode: 1, timestamp: -1 });
ChangeHistorySchema.index({ timestamp: -1 });

const ChangeHistory = mongoose.models.ChangeHistory || mongoose.model('ChangeHistory', ChangeHistorySchema);

export default ChangeHistory;