

const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const earningSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },

    direct: { type: Number, default: 0 },
    direct_balance: { type: Number, default: 0 },
    direct_transferred: { type: Number, default: 0 },

    indirect: { type: Number, default: 0 },
    indirect_balance: { type: Number, default: 0 },
    indirect_transferred: { type: Number, default: 0 },

    pair: { type: Number, default: 0 },
    pairing_balance: { type: Number, default: 0 },
    pairing_transferred: { type: Number, default: 0 },

    upgrade_funds: { type: Number, default: 0 },
    upgrade_funds_balance: { type: Number, default: 0 },
    upgrade_funds_used: { type: Number, default: 0 },

    renewal_funds: { type: Number, default: 0 },
    renewal_funds_balance: { type: Number, default: 0 },
    renewal_funds_used: { type: Number, default: 0 },

    cd_funds: { type: Number, default: 0 },
    cd_funds_balance: { type: Number, default: 0 },
    cd_funds_paid: { type: Number, default: 0 },

    fifth_pair: { type: Number, default: 0 },

    royalty: { type: Number, default: 0 },
    royalty_balance: { type: Number, default: 0 },
    royalty_transferred: { type: Number, default: 0 },

    unilevel: { type: Number, default: 0 },
    unilevel_balance: { type: Number, default: 0 },
    unilevel_transferred: { type: Number, default: 0 },

    accumulated: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('earning', earningSchema);
