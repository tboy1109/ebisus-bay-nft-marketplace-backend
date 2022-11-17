import 'dotenv/config'
import cors from 'cors'
import express from "express"
import compression from 'compression'

import apiRouter from './routes/api/router'
import Data from './database/data'
import MarketEvents from './market/listen'
import AuctionEvents from './auction/listen'

const port = process.env.API_PORT || 8080

let app = express()
app.use(compression())
app.set('etag', 'strong')
app.use(cors({ origin: '*' }))

app.use('/', apiRouter)

app.listen(port, async () => {

    const host = process.env.AWS_MYSQL_HOST
    const user = process.env.AWS_MYSQL_USER
    const database = process.env.AWS_MYSQL_DATABASE
    const queueLimit = +process.env.AWS_MYSQL_QUEUE_LIMIT
    const connectionLimit = +process.env.AWS_MYSQL_CONN_LIMIT

    console.log("api", port, JSON.stringify({host, user, database, queueLimit, connectionLimit}))

})
