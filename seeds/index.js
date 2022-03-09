const cities = require('./cities')
const {places, descriptors} = require('./seedHelper')
const mongoose = require('mongoose');
const Campground = require('../modals/campground')


mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => console.log('connect database'))
    .catch(err => console.log(err))

// lay random el trong array
const sample = array => array[Math.floor(Math.random() * array.length)]

//tao database random
const seedDB = async() => {
    await Campground.deleteMany({})
    for(let i = 0; i < 300; i++){
        const price = Math.floor(Math.random() * 20) + 10
        const rand1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            author: '622327750322cd1bb627de3b',
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
              type:"Point",
              coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]
            },
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Natus delectus saepe maxime sit voluptate illo inventore nostrum aliquid rerum eum, architecto itaque maiores obcaecati error dolores hic, temporibus molestias voluptatem.',
            imgs: [
                {
                  url: 'https://res.cloudinary.com/dkqcqawm6/image/upload/v1646723555/YelpCamp/ll9yf8pvs64fv7snhnbj.jpg',
                  filename: 'YelpCamp/rriqlwliw6cu22vgttfy',
                }
              ]
              ,
            price,
        })
        await camp.save()
    }
}

seedDB().then(() => {
    //https://mongoosejs.com/docs/connections.html#multiple_connections
    mongoose.connection.close()
})