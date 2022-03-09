const express = require('express')
const router = express.Router({mergeParams: true})// merge params cua router va param cua use trong file index
const catchAsyncErr = require('../utils/catchAsyncErr')
const reviewCtrl = require('../controllers/review')

const {reviewValidate, isLoggedIn, isReviewAuthor} = require('../middleware')

router.post('/', isLoggedIn, reviewValidate, catchAsyncErr(reviewCtrl.review))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsyncErr(reviewCtrl.delete))


module.exports = router