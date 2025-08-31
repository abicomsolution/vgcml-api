
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const codeSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    sender_id: { type: Schema.Types.ObjectId, ref: 'member' },
    date_created: { type: Date, default: null },
    time_created: { type: Date, default: null },
    datetime_sent: { type: Date, default: null },
    datetime_used: { type: Date, default: null },
    codenum: { type: 'String' },
    status: { type: Number, default: 0 },
    codetype: { type: Number, default: 0 },
    isCD: { type: Number, default: 0 }
}, { toJSON: { virtuals: true } });

codeSchema.virtual('value').get(function () {
    return this._id;
})

codeSchema.virtual('label').get(function () {
    var retS = ""
    if (this.isCD == 1) {
        retS = this.codenum + " - CD";
    } else {
        retS = this.codenum;
    }
    if (this.codetype == 0) {
        retS = retS + " (Reseller)"
    } else if (this.codetype == 1) {
        retS = retS + " (Dealer)"
    } else if (this.codetype == 2) {
        retS = retS + " (Dealer's Add Account)"
    }
    return retS;
})

module.exports = mongoose.model('code', codeSchema);

// codetype
// 0 - Reseller's Package
// 1 - Dealer's Package
// 2 - Dealer's Add Account

// status
// 0 - available
// 1 - used