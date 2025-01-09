const express = require('express')
const morgan = require('morgan')
const {readdirSync} = require('fs')
const cors = require('cors')

const app = express();

app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

readdirSync('./src/routers').map((item)=> app.use('/api', require('./routers/'+item)))




app.listen(5000,()=>console.log('server is runing on port 5000'))