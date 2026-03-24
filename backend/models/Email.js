const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  to: { type: String, required: true, index: true },
  from: { type: String, required: true },
  subject: { type: String, default: '(Sem Assunto)' },
  bodyHtml: { type: String },
  bodyText: { type: String },
  receivedAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

module.exports = mongoose.model('Email', EmailSchema);
