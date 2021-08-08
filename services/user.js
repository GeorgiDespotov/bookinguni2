const User = require('../modews/User');


async function createUser(username, hashedPassword, email) {
    const user = new User({
        username,
        hashedPassword,
        email,
        bookedHotels: []
    });

    user.save();
    return user;
}

async function getUserByUsername(username) {
    const pattern = new RegExp(`^${username}$`, 'i');
    const user = await User.findOne({username: {$regex: pattern}});
    return user;
} 

async function getUserByEmail(email) {
    const pattern = new RegExp(`^${email}$`, 'i');
    const user = await User.findOne({email: {$regex: pattern}});
    return user;
} 

async function getUserById(id) {
    const user = await User.findById(id).populate('bookedHotels').lean();

    return user;
}
 
module.exports = {
    createUser,
    getUserByUsername,
    getUserByEmail,
    getUserById
}