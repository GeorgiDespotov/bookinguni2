const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userService = require('../services/user');
const { TOKEN_SECRET, COOKIE_NAME } = require('../config');


module.exports = () => function (req, res, next) {
    if (parseToken(req, res)) {
        req.auth = {
            async register(username, password, email) {
                const token = await register(username, password, email);
                res.cookie(COOKIE_NAME, token);
            },
            async login(username, password) {
                const token = await login(username, password);
                res.cookie(COOKIE_NAME, token);
            },
            logout() {
                res.clearCookie(COOKIE_NAME)
            }
        }
    }

    next();
};



async function register(username, password, email) {
    const existingUsername = await userService.getUserByUsername(username);
    const existingEmail = await userService.getUserByEmail(email);

    if (existingEmail) {
        throw new Error('Email is taken!');
    }

    if (existingUsername) {
        throw new Error('Username is taken!');
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser(username, hashedPassword, email);

    return genereteToken(user);
}

async function login(username, password) {
    const user = await userService.getUserByUsername(username);

    if (!user) {
        const err = new Error('no such user');
        err.type = 'credential';
        throw err;
    }

    const hasMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!hasMatch) {
        const err = new Error('wrong password');
        err.type = 'credential';
        throw err;
    }

    return genereteToken(user);
}

function genereteToken(userData) {
    return jwt.sign({
        _id: userData._id,
        username: userData.username,
        email: userData.email
    }, TOKEN_SECRET);
}

function parseToken(req, res) {
    const token = req.cookies[COOKIE_NAME];
    if (token) {
        try {
            const userData = jwt.verify(token, TOKEN_SECRET);
            req.user = userData;
            res.locals.user = userData;
        } catch (err) {
            res.clearCookie(COOKIE_NAME);
            res.redirect('/auth/login');

            return false;
        }
    }
    return true;
}