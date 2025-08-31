

const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const unilevel_referralSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },  
    transferred : Number,
    accumulated : Number,
    balance : Number
});

module.exports = mongoose.model('unilevel_referral', unilevel_referralSchema);
