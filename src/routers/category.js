const express = require('express')

const {create,list,remove} = require('../controllers/category')
const {authCheck, adminCheck} = require('../middleware/authCheck')
const router = express.Router()

router.post('/category',authCheck,adminCheck,create)
router.get('/category',authCheck,adminCheck,list)
router.delete('/category/:id',remove)

module.exports = router