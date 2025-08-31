
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const monthlyUDetailSchema = new Schema({      
    monthly_unilevel_id: { type: Schema.Types.ObjectId, ref: 'monthly_unilevel' },    
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header' },      
    puchase_id: { type: Schema.Types.ObjectId, ref: 'purchases' },      
    points: { type: Number, default: 0},
    level: { type: Number, default: 0},    
    transtype: Number
});

module.exports = mongoose.model('monthly_unilevel_detail', monthlyUDetailSchema);