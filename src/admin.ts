import 'dotenv/config'
import path from 'path'
import cors from 'cors'
import express, {Request} from "express"
import compression from 'compression'
import basicAuth from 'express-basic-auth'

import consoleRouter from './routes/console/router'
import CronSchedule from './cron/schedule'
import TaskStats from './database/task/stats'
import MarketListen from './market/listen'

const port = process.env.ADMIN_PORT || 8888

let app = express()
app.use(compression())
app.set('etag', 'strong')
app.use(cors({origin: '*'}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static('public'))

const auth = basicAuth({
    users: { 'admin': 'admin123' },
    realm: 'admin.ebisusbay.com',
    challenge: true
})
app.use((req, res, next) => shouldAuthenticate(req) ? auth(req, res, next) : next());

app.use('/', consoleRouter)

const shouldAuthenticate = (req: Request): boolean => {
    if(req.path === '/health') return false
    return true
}

MarketListen.Now()

CronSchedule.Install()

app.listen(port, async () => {

    const host = process.env.AWS_MYSQL_HOST
    const user = process.env.AWS_MYSQL_USER
    const database = process.env.AWS_MYSQL_DATABASE
    const queueLimit = +process.env.AWS_MYSQL_QUEUE_LIMIT
    const connectionLimit = +process.env.AWS_MYSQL_CONN_LIMIT

    console.log("admin", port, {host, user, database, queueLimit, connectionLimit})


})
