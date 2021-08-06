const { Schema, model } = require('mongoose');
const Hotel = require('./Hotel');

const schema = new Schema({
    username: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    email: { type: String }
    // bookedHotels: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
    // offeredHotels: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }]
});

module.exports = model('User', schema);