
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const processtrackerSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    transdate: { type: Date, default: null },
    count:{ type: Number, default: 0 }, 
    status: { type: Number, default: 0 }   
});

module.exports = mongoose.model('processtracker', processtrackerSchema);


