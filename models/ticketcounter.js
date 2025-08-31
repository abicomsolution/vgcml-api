
const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const ticketcounterSchema = new Schema({      
    _id:  { type: 'String', default: ''},   
    seq: { type: Number, default: 0 }    
});

module.exports = mongoose.model('ticketcounter', ticketcounterSchema);