import Auction from "./auction"
import Collection from "./collection"
import Listing from "./listing"
import Marketdata from "./marketdata"
import Nft from "./nft"

export default class ApiResponse {

    status: number
    error?: string

    page?: number
    pageSize?: number
    totalCount?: number
    totalPages?: number

    nft?: Nft
    auctions?: Auction[]
    listings?: Listing[]
    marketdata?: Marketdata
    collections?: Collection[]

    data?: any[]

    constructor(status: number, error: string = undefined){
        this.status = status
        this.error = error
    }

}