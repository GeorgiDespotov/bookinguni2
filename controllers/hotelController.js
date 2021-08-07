const { isUser } = require('../middlewears/guards');
const { body, validationResult } = require('express-validator');
const router = require('express').Router();

router.get('/create', isUser(), (req, res) => {
    res.render('hotels/create');
});

router.post('/create',
    body('name')
        .notEmpty().withMessage('Hotelname is required!').bail()
        .isLength({ min: 4 }).withMessage('Hotelname must be atleast 4 symbols long!').bail(),
    body('city')
        .notEmpty().withMessage('City is required!').bail()
        .isLength({ min: 3 }).withMessage('City name must be atleast 3 symbols long').bail(),
    body('imageUrl')
        .notEmpty().withMessage('Image URL is required!').bail()
        .matches('^https?').withMessage('Image Url must be valid!').bail(),
    body('freeRooms')
        .notEmpty().withMessage('Freee rooms field is required!').bail()
        .isNumeric().withMessage('Free rooms must be a number!').bail()
        .isInt({ min: 1, max: 100 }).withMessage('the rooms must be betwien 1 and 100!').bail(),

    isUser(), async (req, res) => {
        const { errors } = validationResult(req);

        try {
           
            req.body.owner = req.user._id;

            if (errors.length > 0) {
                throw new Error(errors.map(err => err.msg).join('\n'));
            }

            await req.storage.createHotel(req.body);
            res.redirect('/');
        } catch (err) {
            console.log(err.message);

            const ctx = {
                errors: err.message.split('\n'),
                hotelData: {
                    name: req.body.name,
                    city: req.body.city,
                    imageUrl: req.body.imageUrl,
                    freeRooms: Number(req.body.freeRooms)
                }
            }
            res.render('hotels/create', ctx);

        }
    });

router.get('/details/:id', isUser(), async (req, res) => {
    try {
        const hotel = await req.storage.getOneHotel(req.params.id);
        hotel.isOwner = req.user._id == hotel.owner;
        hotel.allreadyBooked = hotel.usersBookedRoom.find(user => user._id == req.user._id);
        res.render('hotels/details', { hotel });
    } catch (err) {
        console.log(err.message);
        res.render('/404');
    }
});

router.get('/book/:id', isUser(), async (req, res) => {
    try {
        const hotel = await req.storage.getOneHotel(req.params.id);
        const allreadyBooked = hotel.usersBookedRoom.find(user => user._id == req.user._id);

        if (hotel.owner == req.user._id) {
            throw new Error('You can\'t book youre own Hotel!');
        }

        if (allreadyBooked) {
            throw new Error('You allredy booked this Hotel!');
        }

        await req.storage.bookHotel(req.params.id, req.user._id);
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/hotels/details/${req.params.id}`);
    }
});

router.get('/delete/:id', isUser(), async (req, res) => {
    try {
        const hotel = await req.storage.getOneHotel(req.params.id);

        if (req.user._id != hotel.owner) {
            throw new Error('Only the owner can delete this offer!');
        }
        await req.storage.deleteHotel(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/hotels/details/${req.params.id}`);
    }
});

router.get('/edit/:id', isUser(), async (req, res) => {
    try {
        const hotel = await req.storage.getOneHotel(req.params.id);

        if (hotel.owner != req.user._id) {
            throw new Error('Only the owner can edit this offer!');
        }
        res.render('hotels/edit', { hotel });
    } catch (err) {
        console.log(err.message);
        res.redirect(`/hotels/details/${req.params.id}`);
    }
});

router.post('/edit/:id', isUser(),
    body('name')
        .notEmpty().withMessage('Hotelname is required!').bail()
        .isLength({ min: 4 }).withMessage('Hotelname must be atleast 4 symbols long!').bail(),
    body('city')
        .notEmpty().withMessage('City is required!').bail()
        .isLength({ min: 3 }).withMessage('City name must be atleast 3 symbols long').bail(),
    body('imageUrl')
        .notEmpty().withMessage('Image URL is required!').bail()
        .matches('^https?').withMessage('Image Url must be valid!').bail(),
    body('freeRooms')
        .notEmpty().withMessage('Freee rooms field is required!').bail()
        .isNumeric().withMessage('Free rooms must be a number!').bail()
        .isInt({ min: 1, max: 100 }).withMessage('the rooms must be betwien 1 and 100!').bail(),

    async (req, res) => {
        const { errors } = validationResult(req);
        try {
            const hotel = await req.storage.getOneHotel(req.params.id);
            if (req.user._id != hotel.owner) {
                throw new Error('Only the owner can edit this offer!');
            }
            if (errors.length > 0) {
                throw new Error(errors.map(err => err.msg).join('\n'));
            }
            await req.storage.editHotel(req.params.id, req.body);
            res.redirect(`/hotels/details/${req.params.id}`);
        } catch(err) {
            console.log(err.message);
            const ctx = {
                errors: err.message.split('\n'),
                hotel: {
                    _id: req.params.id,
                    name: req.body.name,
                    city: req.body.city,
                    freeRooms: Number(req.body.freeRooms),
                    imageUrl: req.body.imageUrl
                }
            }
            res.render('hotels/edit', ctx);
        }
    });

module.exports = router;
