
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const transactionStatusSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    transaction_id: { type: Number, default: 0 }
});

module.exports = mongoose.model('transaction_status', transactionStatusSchema);