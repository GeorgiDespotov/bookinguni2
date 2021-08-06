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
            const hotelData = {
                name: req.body.name,
                city: req.body.city,
                imageUrl: req.body.imageUrl,
                freeRooms: Number(req.body.freeRooms),
                owner: req.user._id
            }

            if (errors.length > 0) {
                throw new Error(errors.map(err => err.msg).join('\n'));
            }

            await req.storage.createHotel(hotelData);
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

module.exports = router;
