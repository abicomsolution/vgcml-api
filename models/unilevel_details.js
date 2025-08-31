
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const unilevelDetailsSchema = new Schema({        
    unilevel_id: { type: Schema.Types.ObjectId, ref: 'unilevel_header' },
    transdate: { type: Date, default: null},
    transtime: { type: Date, default: null},
    transtype: Number,
    level: Number,
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    point : Number
});

module.exports = mongoose.model('unilevel_details', unilevelDetailsSchema);