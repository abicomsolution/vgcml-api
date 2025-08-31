

const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const unilevelHeaderSchema = new Schema({        
    binary_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    smonth: { type: Date, default: null},
    syear: { type: Date, default: null},
    status: Number,
    personal: Number,
    group : Number,
    unilevel : Number
});

module.exports = mongoose.model('unilevel_header', unilevelHeaderSchema);