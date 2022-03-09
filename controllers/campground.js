const Campground = require('../modals/campground')
const cloudinary = require("cloudinary").v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_BOX });
// stylesService exposes listStyles(), createStyle(), getStyle(), etc.

module.exports = {
    campgroundIndex: async (req, res) => {
        const campgrounds = await Campground.find()
        res.render('campgrounds/index', {campgrounds})
    },
    createCampground: async (req, res, next) => {
        // kiem tra xem form co bi trong hay khong
        // if(Object.keys(req.body).length === 0) throw new appError('pls enter full data', 400)
        const geoData = await geocoder.forwardGeocode({
            query: req.body.location,
            limit: 1
        }).send()
        const campground = new Campground(req.body)
        campground.geometry = geoData.body.features[0].geometry
        campground.imgs = req.files.map(img => ({url: img.path, filename: img.filename}))
        campground.author = req.user._id
        const id = campground._id
        await campground.save()
        req.flash('success', 'Campground is added successfully!')
        res.redirect(`/campgrounds/${id}`)
    },
    showCampground: async (req, res, next) => {
        const {id} = req.params
        // populate de lay ra dc review vi trong campground chi luu objectId cua review
        const campground = await Campground.findById(id)
            .populate({ // across populate
                path:'reviews',
                populate: {
                    path: 'author',
                }
            })
            .populate('author')
        if(!campground){
            req.flash('error', 'Campground was not found')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', {campground})
    },
    renderEditCampgroundForm: async (req, res) => {
        const {id} = req.params
        const campground = await Campground.findById(id)
        res.render('campgrounds/edit', {campground})
    },
    renderCreateForm: (req, res) => {
        res.render('campgrounds/new')
    },
    updateCampground: async (req, res) => {
        const {id} = req.params
        const newCamp = req.body
        const camp = await Campground.findByIdAndUpdate(id, newCamp, {new: true})

        const geoData = await geocoder.forwardGeocode({
            query: req.body.location,
            limit: 1
        }).send()
        camp.geometry = geoData.body.features[0].geometry

        const img = req.files.map(img => ({url: img.path, filename: img.filename}))
        camp.imgs.push(...img)

        await camp.save()
        if(req.body.deleteImg){
            for(let filename of req.body.deleteImg){
                cloudinary.uploader.destroy(filename)
            }
            await camp.updateOne({$pull: {imgs: {filename: {$in: req.body.deleteImg}}}}, {new: true})
        }
        req.flash('success', 'Successfully updated campground!')
        res.redirect(`/campgrounds/${camp._id}`)
    },
    deleteCampground: async (req, res) => {
        const {id} = req.params
        await Campground.findByIdAndDelete(id)
        req.flash('success', 'Successfully deleted campground!')
        res.redirect('/campgrounds')
    }
}