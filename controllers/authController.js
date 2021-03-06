const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { isGuest, isUser } = require('../middlewears/guards');
const userService = require('../services/user');



router.get('/register', isGuest(), (req, res) => {
    res.render('user/register');
});

router.post('/register',
    isGuest(),
    body('email')
        .notEmpty().withMessage('Email is required!').bail()
        .isEmail().withMessage('Email must be valid!').bail(),
    body('username')
        .notEmpty().withMessage('Username is required!').bail()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 ch long').bail(),
    body('password')
        .notEmpty().withMessage('Password is required!').bail()
        .isLength({ min: 3 }).withMessage('Password must be at least 3 symbols long!').bail()
        .isAlphanumeric().withMessage('Password can contain only English letars and digits!').bail(),
    body('rePass').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('password don\'t match!')
        }
        return true
    }),
    async (req, res) => {
        const { errors } = validationResult(req);
        try {
            if (errors.length > 0) {
                // TODO impruve err message
                throw new Error(Object.values(errors).map(e => e.msg).join('\n'));

            }
            await req.auth.register(req.body.username, req.body.password, req.body.email);
            res.redirect('/'); //TODO change redirect location 
        } catch (err) {
            console.log(err);
            const ctx = {
                errors: err.message.split('\n'),
                userData: {
                    username: req.body.username,
                    email: req.body.email
                }
            }
            res.render('user/register', ctx)
        }
    });

router.get('/login', isGuest(), (req, res) => {
    res.render('user/login');
});

router.post('/login', isGuest(), async (req, res) => {
    try {
        await req.auth.login(req.body.username, req.body.password);
        res.redirect('/'); //TODO change redirect location 
        ``
    } catch (err) {
        console.log(err);
        if (err.type == 'credential') {
            errors = ['incorect username or password!']
        }
        const ctx = {
            errors,
            userData: {
                username: req.body.username
            }
        };
        res.render('user/login', ctx);
    }
});

router.get('/logout', (req, res) => {
    req.auth.logout();
    res.redirect('/');
});

router.get('/profile', isUser(), async (req, res) => {
    try {
        const user = await userService.getUserById(req.user._id);

        user.hotelNames = user.bookedHotels.map(hotel => hotel.name).join(', ');
        res.render('user/profile', { user });
    } catch (err) {
        console.log(err.message);
        res.redirect('/auth/login');
    }
});

module.exports = router;
