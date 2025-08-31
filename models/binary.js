const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const binarySchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    transdate: { type: Date, default: null },
    slot_no: { type: 'String' },
    parent_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    left_child_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    right_child_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    left_count: { type: Number, default: 0 },
    right_count: { type: Number, default: 0 },
    total_children: { type: Number, default: 0 },
    headcount: { type: Number, default: 0 },
    total_pairs: { type: Number, default: 0 },
    left_points: { type: Number, default: 0 },
    right_points: { type: Number, default: 0 },
    waiting_points: { type: Number, default: 0 },
    position_on_parent: { type: "String", default: "" },
    pairing: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    transferred: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    isUpgraded: { type: Boolean, default: false },
    codetype: { type: Number, default: 0 },
    account_type: { type: Number, default: 0 },
    renewed: { type: Boolean, default: false },

    cd_account: { type: Boolean, default: false },
    cd_amount: { type: Number, default: 0 },
    cd_balance: { type: Number, default: 0 },
    cd_status: { type: "String", default: "" },
    cd_payment_type: { type: "String", default: "" },
}, { toJSON: { virtuals: true } });

binarySchema.virtual('value').get(function () {
    return this._id;
})

binarySchema.virtual('label').get(function () {
    return this.slot_no
})

module.exports = mongoose.model('binary', binarySchema);

// account_type
// 1 - Reseller
// 2 - Dealer

// cd_status
// - paid
// - unpaid

// cd_payment_type
// - funds
// - code