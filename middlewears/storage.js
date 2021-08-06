const hotelServices = require('../services/hotels');

module.exports = () => (req, res, next) => {
    req.storage = {
        ...hotelServices
    };
    next();
};