const express = require('express')

const {authCheck,adminCheck} = require('../middleware/authCheck')
const { payment, listPayment } = require('../controllers/stripe')
const router =  express.Router()


router.post('/user/create-payment-intent',authCheck,payment)
router.get('/admin/list-payment-intent',authCheck,adminCheck,listPayment)






module.exports = router