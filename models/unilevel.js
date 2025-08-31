

const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const unilevelSchema = new Schema({
    transdate: { type: Date, default: null},
    transtime: { type: Date, default: null},
    parent_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    child_id: { type: Schema.Types.ObjectId, ref: 'binary' },
    level: Number,
    position_on_parent: { type: "String", default: "" }
});

module.exports = mongoose.model('unilevel', unilevelSchema);