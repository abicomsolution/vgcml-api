

const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const unilevel_referral_transSchema = new Schema({
    unilevel_referral_id: { type: Schema.Types.ObjectId, ref: 'unilevel_referral' },  
    transdate: { type: Date, default: null},
    transtime: { type: Date, default: null},    
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    trans_type : Number,    
    level : Number,  
    amount : Number
});

module.exports = mongoose.model('unilevel_referral_transaction', unilevel_referral_transSchema);
