const Campground = require('./modals/campground')
const appError = require('./utils/appError')
const joi = require('joi');
const Review = require('./modals/review')

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        // isAuthenticated cua passport check xem ng dung da dang nhap hay chua thong qua session
        req.session.returnTo = req.originalUrl // save url ma nguoi dung muon truy cap 
        req.flash('error', 'You must be log in!')
        return res.redirect('/login')
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You dont have a permission!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You dont have a permission!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.Validate = (req, res, next) => {
    const schema = joi.object({
        title: joi.string().required(),
        location: joi.string().required(),
        // img: joi.string().required(),
        price: joi.number().required().min(0),
        description: joi.string().required(),
        deleteImg: joi.array()
    })
    const {error} = schema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new appError(msg, 400)
    }else{next()}
}

module.exports.reviewValidate = (req, res, next) => {
    const review = joi.object({
        rating: joi.number().required().min(1).max(5),
        body: joi.string().required()
    }).required()
    const {error} = review.validate(req.body.review)
    if(error){
        const msg = error.details.map(el => el.message).join(', ')
        throw new appError(msg, 400)
    }else{next()}
}

