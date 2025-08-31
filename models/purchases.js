
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const purchasesSchema = new Schema({        
    member_id: { type: Schema.Types.ObjectId, ref: 'member'},
    account_type: { type: Number, default: 0},
    transdate: { type: Date, default: null},
    transtime: { type: Date, default: null},
    order_id: { type: Schema.Types.ObjectId, ref: 'order_header'},
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    productname:  { type: 'String', default: '' },      
    price: { type: 'String', default: '' },  
    discountedprice: { type: Number, default: 0},
    qty: { type: Number, default: 0},    
    discount: { type: Number, default: 0},
    subtotal: { type: Number, default: 0},
    productcode: { type: 'String', default: '' },  
    cv: { type: Number, default: 0},
    transtype: { type: Number, default: 0},
    dealers_price: { type: Number, default: 0},
    resellers_price: { type: Number, default: 0},
});

module.exports = mongoose.model('purchases', purchasesSchema);