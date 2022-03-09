if(process.env.NODE_ENV !== "production"){
   require('dotenv').config()
}
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const morgan = require('morgan')
const ejsMate = require('ejs-mate')
const appError = require('./utils/appError.js')
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./modals/user')
const helmet = require('helmet')

const app = express()

const campgroundRout = require('./routes/campgrounds')
const reviewRout = require('./routes/review')
const userRout = require('./routes/user')

const MongoDBStore = require('connect-mongo')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl)
    .then(() => console.log('connect database'))
    .catch(err => console.log(err))

app.engine('ejs', ejsMate)
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(flash())
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

const secret = process.env.SECRET || 'thisismysecret'
//setup store cua session trong mongodb
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on('error', (e) => {
    console.log('Session error', e)
})

const sessionOptions = {
    store, // mac dinh session dc luu trong ram cua server, them option store de luu session vao db mong muon
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date().now + 1000 *60 * 60 * 24 * 7,
        httpOnly: true,// cai nay de bao mat
        maxAge: 1000 *60 * 60 * 24*7,
    }
}

app.use(session(sessionOptions))

// khoi tao passport
app.use(passport.initialize())
// su dung session de giu ng dung dang nhap lien tuc
app.use(passport.session())
// passport su dung Strategy la local authenticate tren User. co nhieu loai strategies nhu fb, gg , ... 
passport.use(new localStrategy(User.authenticate()))

// luu data trong session. Generates a function that is used by Passport to serialize users into the session
passport.serializeUser(User.serializeUser())
// lay data tu trong session ra. Generates a function that is used by Passport to deserialize users into the session
passport.deserializeUser(User.deserializeUser())
// middleware set flash and define isUserLogin
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// app.use(helmet({contentSecurityPolicy: false}))
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// //This is the array that needs added to
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["self", ...connectSrcUrls],
//             scriptSrc: ["unsafe-inline", "self", ...scriptSrcUrls],
//             styleSrc: ["self", "unsafe-inline", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "self",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dkqcqawm6/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/campgrounds', campgroundRout)
app.use('/campgrounds/:id/reviews', reviewRout)
app.use('/', userRout)

app.all('/*', (req, res, next) => {
    throw new  appError('this path dont exist!', 404)
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) {err.message = 'Something went wrong'}
    res.status(statusCode).render('err', {err})
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is running on port ${port}!`)
})