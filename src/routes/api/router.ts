import { Router, Request, Response, NextFunction } from "express"
import Data from "../../database/data"
import Database from "../../database/database"
import ApiAuctions from "./auctions"
import ApiCollections from "./collections"
import ApiListings from "./listings"
import ApiMarketData from "./marketdata"
import ApiNfts from "./nfts"

const apiRouter = Router()

apiRouter.get('/', async (req: Request, res: Response) => {
    
    res.json({})

})

apiRouter.get('/health', async (req: Request, res: Response) => {
    
    try{
        let health = await Database.Health()
        res.status(200).json({ "db": health})
    }
    catch(error){
        res.status(500).json({ "db": error.message})
    }

})

apiRouter.get('/auctions', async (req: Request, res: Response) => {

    const api = new ApiAuctions()
    const apiresponse = await api.process(req.query)

    if(apiresponse.status !== 200){
        res.status(apiresponse.status)
    }
    res.json(apiresponse)

})

apiRouter.get('/data', async (req: Request, res: Response) => {

    const results = await Data.Select({ name: req.query.name })
    if(results && results.length > 0){
        const auctions = JSON.parse(results[0].value)
        res.json(auctions)
    } else {
        res.json({})
    }

})

apiRouter.get('/nft', async (req: Request, res: Response) => {

    const api = new ApiNfts()
    const apiresponse = await api.process(req.query)

    if(apiresponse.status !== 200){
        res.status(apiresponse.status)
    }
    res.json(apiresponse)

})

apiRouter.get('/listings', async (req: Request, res: Response) => {

    const api = new ApiListings()
    const apiresponse = await api.process(req.query)

    if(apiresponse.status !== 200){
        res.status(apiresponse.status)
    }
    res.json(apiresponse)

})

apiRouter.get('/unfilteredlistings', async (req: Request, res: Response) => {

    const api = new ApiListings()
    const apiresponse = await api.process(req.query, false)

    if(apiresponse.status !== 200){
        res.status(apiresponse.status)
    }
    res.json(apiresponse)

})

apiRouter.get('/collections', async (req: Request, res: Response) => {

    const api = new ApiCollections()
    const apiresponse = await api.process(req.query)

    if(apiresponse.status !== 200){
        res.status(apiresponse.status)
    }
    res.json(apiresponse)

})

apiRouter.get('/marketdata',  async (req: Request, res: Response) => {

    const api = new ApiMarketData()
    const apiresponse = await api.process(req.query)

    if(apiresponse.status !== 200){
        res.status(apiresponse.status)
    }
    res.json(apiresponse.marketdata)

})

export default apiRouter