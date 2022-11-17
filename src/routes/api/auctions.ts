import Data from "../../database/data"
import ApiResponse from "../../types/apiresponse"
import Auction from "../../types/auction"


export default class ApiAuctions {

    response = new ApiResponse(200, undefined)

    process = async (query: any) => {

        if(this.validate(query)){
            const results = await Data.Select({ name: 'auctions' })
            if(results && results.length > 0){
                let auctions = JSON.parse(results[0].value)
                if(query.auctionId){
                    auctions = auctions.filter( (a: Auction) => {
                        const auctionIds = query.auctionId.split(",").map(Number)
                        if(auctionIds.includes(a.auctionId)) return a
                    })
                }
                this.response.auctions = auctions
            }
        }

        return this.response

    }

    validate = (query: any): boolean => {

        const valid = ['auctionid']

        Object.keys(query).forEach(param => {
            param = param.toLowerCase()
            if (!valid.includes(param)) {
                this.response.status = 400
                this.response.error = "Invalid parameter specified"
                return false
            }
        })

        return true

    }
}