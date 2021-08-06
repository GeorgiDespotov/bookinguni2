const { Schema, model, SchemaTypes } = require('mongoose');


const schema = new Schema({
    name: { type: String },
    city: { type: String },
    imageUrl: { type: String },
    freeRooms: { type: Number },
    usersBookedRoom: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = model('Hotel', schema);