const Hotel = require('../modews/Hotel');

async function getAllHotels() {
    return Hotel.find().sort({ freeRooms: -1 }).lean();
}

async function getOneHotel(id) {

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

module.exports = {
    getAllHotels,
    getOneHotel,
    createHotel
}