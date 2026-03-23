const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true, default: Date.now },
  completedAt: Date,
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
  totalScraped: { type: Number, default: 0 },
  totalMatched: { type: Number, default: 0 },
  totalUpdated: { type: Number, default: 0 },
  totalFailed: { type: Number, default: 0 },
  syncErrors: [{ product: String, error: String }],
  duration: Number,
  triggeredBy: { type: String, enum: ['manual', 'auto'], default: 'manual' },
}, { timestamps: true });

module.exports = mongoose.model('SyncLog', syncLogSchema);
