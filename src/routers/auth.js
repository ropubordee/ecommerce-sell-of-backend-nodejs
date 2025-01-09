const express = require('express')
const {register , login, currentUser} = require('../controllers/auth')
const {authCheck , adminCheck} =require('../middleware/authCheck')

const router =  express.Router()


router.post('/register',register)
router.post('/login',login)
router.post('/current-user',authCheck,currentUser)
router.post('/current-admin',authCheck,adminCheck,currentUser)




module.exports = router