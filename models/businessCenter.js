const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const businessCenterSchema = new Schema({
    code:  { type: 'String', default: ""},
    address:  { type: 'String', default: ""},
    member: { type: Schema.Types.ObjectId, ref: 'member' },
    province: { type: Schema.Types.ObjectId, ref: 'province' },
    city: { type: Schema.Types.ObjectId, ref: 'city' },
    mobileno:  { type: 'String', default: ""},
    telno:  { type: 'String', default: ""},
    bc_type:  { type: Number, default: -1}
}, {toJSON: { virtuals: true }});

// businessCenterSchema.virtual('value').get(function(){
//     return this._id;
// })
// businessCenterSchema.virtual('label').get(function(){
//     return this.fname + ' ' + this.lname;
// })

module.exports = mongoose.model('businessCenter', businessCenterSchema);


//bc_type-> 0=mini hub, 1=stockist