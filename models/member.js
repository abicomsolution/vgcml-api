
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    username: { type: 'String', default: '' },
    pwd: { type: 'String', default: '' },
    plain_pwd: { type: 'String', default: '' },
    fullname: { type: 'String', default: '' },
    fname: { type: 'String', default: '' },
    lname: { type: 'String', default: '' },
    mname: { type: 'String', default: '' },
    gender: { type: Number, default: 0 },
    birthdate: { type: Date, default: null },
    emailadd: { type: 'String', default: '' },
    sponsorid: { type: Schema.Types.ObjectId, ref: 'member' },
    photo_thumb: { type: 'String', default: '' },
    cover_photo: { type: 'String', default: '' },
    binary_tmp_photo: { type: 'String', default: '' },

    account_type: { type: Number, default: 0 },
    activated: { type: Boolean, default: false },

    date_signup: { type: Date, default: null },
    date_time_activated: { type: Date, default: null },
    last_accessed: { type: Date, default: null },
    mobile1: { type: 'String', default: '' },
    mobile2: { type: 'String', default: '' },
    address1: { type: 'String', default: '' },
    address2: { type: 'String', default: '' },
    province: { type: Schema.Types.ObjectId, ref: 'province' },
    city: { type: Schema.Types.ObjectId, ref: 'city' },
    zipcode: { type: 'String', default: '' },
    isCompleteInfo: { type: Number, default: 0 },

    id_filepath: { type: 'String', default: '' },
    qr_code_path: { type: 'String', default: '' },
    qr_pwd: { type: 'String', default: '' },

    referral_code: { type: "String", default: "" },
    target_placement: { type: Schema.Types.ObjectId, ref: 'binary', default: null },
    target_position: { type: Number, default: 0 },

    receive_renewal_funds: { type: Boolean, default: false },
    current_login: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }    
}, { toJSON: { virtuals: true } });

memberSchema.virtual('value').get(function () {
    return this._id;
})
memberSchema.virtual('label').get(function () {
    return this.fname + ' ' + this.lname;
})


module.exports = mongoose.model('member', memberSchema);
