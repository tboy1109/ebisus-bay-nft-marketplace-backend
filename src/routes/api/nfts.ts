
import MarketUpdate from "../../market/update";
import ApiResponse from "../../types/apiresponse";
import Listing from "../../types/listing";
import Nft from "../../types/nft";
import Api from "./api";
import ApiListings from "./listings";

export default class ApiNfts extends Api{

    response = new ApiResponse(200, null)

    process = async (query: any): Promise<ApiResponse> => {

        let data = []
        if(this.validate(query)){
            const ids = query.tokenId.split(",")
            for(let i = 0; i < ids.length; i++){

                query.tokenId = ids[i]
                query.collection = query.collection.toLowerCase()

                let item = {nft: undefined, listings: undefined}
                item.nft = await this.executeNft(query)
                item.listings = await this.executeListings(query)
                
                data.push(item)
            }
            if(ids.length == 1){
                const item = data.pop()
                this.response.nft = item ? item.nft : undefined
                this.response.listings = item ? item.listings : undefined
            } else {
                this.response.data = data
            }
        }
        return this.response

    }

    validate = (query: any): boolean => {

        const valid = ['tokenid', 'collection']

        Object.keys(query).forEach(param => {
            if (!valid.includes(param.toLowerCase())) {
                this.response.status = 400
                this.response.error = "Invalid parameter specified - parameters must be one of " + valid.join(", ");
                return false
            }
            if (!query.collection) {
                this.response.status = 400
                this.response.error = "The `tokenId` parameter must also be supplied with `collection`";
                return false
            }
        })

        return true
    }

    executeNft = async (query: any): Promise<Nft> => {

        const collection = query.collection
        const nftId = query.tokenId
        const key = 'files/' + collection + "/metadata/" + nftId + ".json"
        return await MarketUpdate.FromBucket(process.env.AWS_S3_BUCKET, key)

    }

    executeListings = async (query: any): Promise<Listing[]> => {

        const api = new ApiListings()
        const filter = api.filter(query)
        return await api.execute(filter, '', '')

    }

}
