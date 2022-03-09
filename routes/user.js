const express = require('express')
const router = express.Router()
const catchAsyncErr = require('../utils/catchAsyncErr')
const passport = require('passport')
const userCtl = require('../controllers/user')

router.route('/register')
    .get(userCtl.renderRegisterForm)
    .post(catchAsyncErr(userCtl.register))

router.route('/login')
    .get(userCtl.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), userCtl.login)

router.get('/logout', userCtl.logout)

module.exports = router