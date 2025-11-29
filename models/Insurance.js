const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const insuranceSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  policyNumber: { type: String, required: true },
  provider: { type: String, required: true },
  coverageDetails: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Insurance', insuranceSchema);