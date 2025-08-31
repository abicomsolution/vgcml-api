
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const earningTransSchema = new Schema({
    earning_id: { type: Schema.Types.ObjectId, ref: 'earning', default: null },
    transdate: { type: Date, default: null },
    earning_type: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    binary_id: { type: Schema.Types.ObjectId, ref: 'binary', default: null },
    account_id: { type: Schema.Types.ObjectId, ref: 'binary', default: null },
    trans_type: { type: Number, default: 0 },
    remarks: { type: 'String', default: "" },
    member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    receiver_member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },
});

module.exports = mongoose.model('earning_transaction', earningTransSchema);

// earning_type
// 0 - Direct Referral              ~ trans_type = 0 - Default | 1 - From Upgrade Funds
// 1 - Upgrade Funds
// 2 - Indirect Referral
// 3 - Pairing                      ~ trans_type = 0 - paid | 1 - pending
// 4 - Fifth pair                   ~ trans_type = 0 - paid | 1 - pending
// 5 - Renewal Funds
// 6 - CD Funds                     ~ trans_type = 0 - from pairing | 1 - from direct referral
// 7 - royalty bonus
// 8 - unilevel commission


// 10 - Direct Transferred
// 11 - Indirect Transferred
// 12 - Pairing Transferred
// 13 - Upgrade Funds Used
// 14 - Renewal Funds Used
// 15 - CD Paid                     ~ trans_type = 0 - from funds | 1 - from code | 2 - transferred
// 16 - royalty transferred
// 17 - unilevel transferred