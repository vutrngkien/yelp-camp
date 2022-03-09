const mongoose = require('mongoose');
const {Schema} = mongoose
const Review = require('./review')

const imgSchema = new Schema({
    url: String,
    filename: String,
})

//tao ra mot property ao khong co trong DBs
imgSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})
// virtual khi stringify thi k co trong obj nen phai them options nay
const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title: String,
    imgs: [imgSchema],
    description: String,
    price: Number,
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], 
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ]
}, opts)

//tao ra mot property ao khong co trong DBs
campgroundSchema.virtual('properties.popUp').get(function() {
    return `<a href="campgrounds/${this._id}">${this.title}</a>`
})
//middleware cua mongo
campgroundSchema.post('findOneAndDelete', async(doc) => {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)