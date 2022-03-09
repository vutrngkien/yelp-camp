const Campground = require('../modals/campground')
const Review = require('../modals/review')


module.exports = {
    review: async (req, res) => {
        const review = new Review(req.body.review)
        const campground = await Campground.findById(req.params.id)
        campground.reviews.unshift(review)
        review.author = req.user._id
        review.save()
        campground.save()
        req.flash('success', 'Created new review!')
        res.redirect(`/campgrounds/${req.params.id}`)
    },
    delete: async (req, res) => {
        const {id, reviewId} = req.params
        await Review.findByIdAndDelete(reviewId)
        //$pull dung de xoa array trong mongoDB
        await Campground.findByIdAndUpdate({_id: id}, {$pull: {reviews: reviewId}})
        req.flash('success', 'Successfully deleted review!')
        res.redirect(`/campgrounds/${req.params.id}`)
    }
}