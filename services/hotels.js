const Hotel = require('../modews/Hotel');

async function getAllHotels() {
    return Hotel.find().sort({ freeRooms: -1 }).lean();
}

async function getOneHotel(id) {
    return Hotel.findById(id).populate('usersBookedRoom').lean();
}

async function createHotel(hotelData) {
    const pattern = new RegExp(`^${hotelData.name}$`, 'i');
    const existingHotel = await Hotel.findOne({ name: { $regex: pattern } });

    if (existingHotel) {
        throw new Error('Hotel with this name allready exist!');
    }

    const hotel = new Hotel(hotelData);
    await hotel.save();

    return hotel;
}

async function bookHotel(hotelId, userId) {
    const hotel = await Hotel.findById(hotelId);

    hotel.usersBookedRoom.push(userId);
    hotel.freeRooms--;

    await hotel.save();

    return hotel;
}

async function deleteHotel(id) {
    return Hotel.findByIdAndDelete(id);
}

async function editHotel(id, hotelData) {
    const hotel = await Hotel.findById(id);

    hotel.name = hotelData.name;
    hotel.city = hotelData.city;
    hotel.freeRooms = Number(hotelData.freeRooms);
    hotel.iamgeUrl = hotelData.iamgeUrl;

    await hotel.save();

    return hotel;
}

module.exports = {
    getAllHotels,
    getOneHotel,
    createHotel,
    bookHotel,
    deleteHotel,
    editHotel
}