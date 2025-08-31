
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const productSchema = new Schema({
    _id: { type: Schema.Types.ObjectId},    
    category_id: { type: Schema.Types.ObjectId, ref: 'product_category' },      
    code:  { type: 'String'},
    productname:  { type: 'String'},
    points: Number,
    uom:  { type: 'String'},
    price: { type: 'String'},
    reseller_price: Number,
    dealer_price: Number,
    bc_price: Number,
    minihub_price: Number,
    stockist_price: Number,
    cv_points: Number,
    description: { type: 'String'},
    me: Number,
    level1: Number,
    level2: Number,
    level3: Number,
    level4: Number,
    level5: Number,
    level6: Number,
    level7: Number,
    level8: Number,
    level9: Number,
    photo_thumb: { type: 'String'},
    isProdPackage: Boolean,
    israffle: { type: Boolean, default: false }
}, {toJSON: { virtuals: true }});

productSchema.virtual('value').get(function(){
    return this._id;
})

productSchema.virtual('label').get(function(){
    return this.productname;
})

module.exports = mongoose.model('product', productSchema);
