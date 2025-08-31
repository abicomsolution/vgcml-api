
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const ticketSchema = new Schema({      
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    transdate:  { type: Date, default: null},  
    account_type: { type: Number, default: 0 },
    stockist_type: { type: Number, default: 0 },    
    purchase_id: { type: Schema.Types.ObjectId, ref: 'purchases' },    
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },  
    codenum:  { type: 'String', default: ''},
    ticketnum:  { type: 'String', default: ''},   
    counter: { type: Number, default: 0 },
    status: { type: Number, default: 0},    
    transtype: { type: Number, default: 0},   
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header' },  
});

module.exports = mongoose.model('ticket', ticketSchema);