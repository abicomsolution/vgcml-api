
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const munilevelSchema = new Schema({
    parent_id: { type: Schema.Types.ObjectId, ref: 'member' },
    child_id: { type: Schema.Types.ObjectId, ref: 'member' },
    level: Number
});

module.exports = mongoose.model('munilevel', munilevelSchema);