const User = require('../modals/user')

module.exports = {
    renderRegisterForm:  (req, res) => {
        res.render('users/register')
    },
    register: async (req, res, next) => {
        try{
            const {email, username, password} = req.body
            const user = new User({username, email})
            const registerUser = await User.register(user, password)
            req.login(registerUser, err => {
                if(err) return next(err)
                req.flash('success', 'Welcome to Yelp_camp')
                res.redirect('/campgrounds')
            })
        }catch(e){
            req.flash('error', e.message)
            res.redirect('/register')
        }
    },
    renderLoginForm: (req, res) => {
        res.render('users/login')
    },
    login: (req, res) => {
        const redirectTo = req.session.returnTo || '/campgrounds'
        req.flash('success', 'Welcome to Yelp_camp')
        res.redirect(redirectTo)
    },
    logout: (req, res) => {
        req.logout()
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')
    }
}