
import dayjs from "dayjs"
import cron, {ScheduledTask} from 'node-cron'
import { Router, Request, Response, NextFunction } from "express"
import Contracts from "../../contract/contracts"
import Database from "../../database/database"
import DbNft from "../../database/nft/table"
import MarketUpdate from "../../market/update"
import { ResultStats } from "../../types/resultstats"
import { State } from "../../types/state"
import NftTable from "../../database/nft/table"
import CronSchedule from "../../cron/schedule"
import TaskTable from "../../database/task/table"

const apiConsoleRouter = Router()

apiConsoleRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {

    res.render("console", { domain: "ebisusbay", tasks: await TaskTable.Select(), listingId: undefined, collection: undefined,  dropdown: await NftTable.DropDown(), states: undefined, modes: undefined, message: '', stats: undefined })

})

apiConsoleRouter.get('/health', async (req: Request, res: Response) => {
    
    try{
        let health = await Database.Health()
        res.status(200).json({ "db": health})
    }
    catch(error){
        res.status(500).json({ "db": error.message})
    }

})

apiConsoleRouter.post('/task', async (req: Request, res: Response) => {

    let data = CronSchedule.Tasks.get(req.body.taskName)
    if(data.task.scheduled){
        data.scheduledTask.stop()
        data.task.scheduled = false
        data.task.running = 0
    } else {
        data.scheduledTask.start()
        data.task.scheduled = true
        data.task.running = 0
    }

    let row = await TaskTable.Replace(data.task)
    CronSchedule.Tasks.set(req.body.taskName, data)

    res.render("console", { domain: "ebisusbay", tasks: await TaskTable.Select(), listingId: undefined, collection: undefined,  dropdown: await NftTable.DropDown(), states: undefined, modes: undefined, message: '', stats: undefined })
})

apiConsoleRouter.post("/refreshMarketplace", async (req: Request, res: Response) => {
    
    let stats = new Array<ResultStats>()
    try {
        
        let baseUrl = process.env.API_HOST + "/unfilteredListings?page=1&pageSize=100000"

        stats.push(await MarketUpdate.Active())
        stats.push(await MarketUpdate.Complete())
        stats.push(await MarketUpdate.Cancelled())

        stats = links(baseUrl, stats)

    } catch(error){
        console.log(error.message)
    }

    res.render("console", { domain: "ebisusbay", tasks: await TaskTable.Select(), listingId: undefined, collection: undefined,  dropdown: await NftTable.DropDown(), states: undefined, modes: undefined, message: undefined, stats  })

})

apiConsoleRouter.post("/refreshListing", async (req: Request, res: Response) => {

    let message = ''
    let listingId = undefined
    let stats = new Array<ResultStats>()
    try {

        if(isNaN(+req.body.listingId)) throw Error("listingId must be numeric")

        listingId = +req.body.listingId
        
        let baseUrl = process.env.API_HOST + "/unfilteredListings?page=1&pageSize=100000&listingId=" + listingId

        let clisting = undefined
        let listing = await Database.AdminListing(listingId)
        if(!listing){
            clisting = await MarketUpdate.GetContractListing(listingId)
        } else {
            clisting = await MarketUpdate.GetContractListingState(listing.listingId, listing.state)
        }

        if(clisting){
            let updatedListing = await MarketUpdate.FromContractListing(clisting)
            if(State.Active === updatedListing.state){
                updatedListing = await MarketUpdate.Invalidate(updatedListing)
            } else{
                updatedListing.setInvalid(listing.invalid)
            }
            let stat = new ResultStats(updatedListing.state)
            stat.total = 1
            stat.updates = await Database.SyncListings([updatedListing])
            stat.errors = 0
            stat.valid = updatedListing.valid ? 1 : 0
            stat.stop()
            stats.push(stat)
        } else {
            message = "unknown listing id"
        }

        stats = links(baseUrl, stats)

    } catch (error) {
        message = error.message
        console.log(message)
    }

    res.render("console", { domain: "ebisusbay", tasks: await TaskTable.Select(), listingId, collection: undefined,  dropdown: await NftTable.DropDown(), states: undefined, modes: undefined, message, stats  })

})

apiConsoleRouter.post("/refreshCollectionListings", async (req: Request, res: Response) => {

    let modes = undefined
    let states = new Array<number>()
    let message = undefined
    let collection = undefined
    let stats = new Array<ResultStats>()
    try {

        collection = String(req.body.collection).trim().toLowerCase()
        
        modes = req.body.modes
        const invalidate = modes === 'invalidate' ? true : false

        if('string' === typeof req.body.state){
            states.push(Number(req.body.state))
        } else if (Array.isArray(req.body.state)) {
            req.body.state.map( (s: string) => { states.push(Number(s))})
        }

        if(states){
            let baseUrl = process.env.API_HOST + "/unfilteredListings?page=1&pageSize=100000&collection=" + collection
            for (let s in State) {
                if (!isNaN(Number(s))) {
                    let state = Number(s)
                    if(states.includes(state)){
                        let listings = await Database.AdminListingsForCollection(state, collection)
                        if(listings === undefined || listings.length === 0){
                            stats.push(await MarketUpdate.Collection(state, collection, invalidate))
                        } else {
                            let stat = await MarketUpdate.UpdateListings(state, listings, invalidate)
                            stat.valid = await Database.AdminStateValidCollectionCount(state, collection)
                            stats.push(stat.stop())
                        }
                    } else {
                        let stat = new ResultStats(state)
                        stat.errors = 0
                        stat.updates = 0
                        let listings = await Database.AdminListingsForCollection(state, collection)
                        stat.total = listings ? listings.length : 0
                        stat.valid = await Database.AdminStateValidCollectionCount(state, collection)
                        stats.push(stat.stop())
                    }
                }
            }
            stats = links(baseUrl, stats)
        }
    } catch (error) {
        message = error.message
        console.log(message)
    }        

    res.render("console", { domain: "ebisusbay", tasks: await TaskTable.Select(), listingId: undefined, collection, dropdown: await NftTable.DropDown(), states, modes, message, stats  })

})

const links = (baseUrl: string, stats: ResultStats[]): ResultStats[] => {

    for(let stat of stats){
        stat.stateLink = `<a border=0 href=${baseUrl}&state=${stat.state} target="_blank"><img src="/img/json.svg" width="16" height="16"></a>`
    }
    return stats

}

export default apiConsoleRouter