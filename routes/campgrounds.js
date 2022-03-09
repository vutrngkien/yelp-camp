const express = require('express')
const router = express.Router()
const catchAsyncErr = require('../utils/catchAsyncErr')
const {isLoggedIn, Validate, isAuthor} = require('../middleware')
const campCtrl = require('../controllers/campground')
const {storage} = require('../cloudinary')
const multer = require('multer');
const upload = multer({ storage });

router.route('/')
    .get(campCtrl.campgroundIndex)
    .post(isLoggedIn, upload.array('img'), Validate, catchAsyncErr(campCtrl.createCampground))
    // .post(upload.single('img') ,(req, res) => {
    //     console.log(req.body, req.file)
    //     res.send('done')
    // })

router.get('/new', isLoggedIn, campCtrl.renderCreateForm)

router.route('/:id')
    .get(catchAsyncErr(campCtrl.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('img'), Validate, catchAsyncErr(campCtrl.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsyncErr(campCtrl.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncErr(campCtrl.renderEditCampgroundForm))


module.exports = router