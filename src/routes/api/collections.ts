import Data from "../../database/data"
import ApiResponse from "../../types/apiresponse"
import Collection from "../../types/collection"
import Api from "./api"

export default class ApiCollections extends Api{

    response = new ApiResponse(200, undefined)

    process = async (query: any) => {

        if(this.validate(query)){

            const results = await Data.Select({name: 'collections'})

            let collections = JSON.parse(results[0].value)
            if(query.collection){
                collections = collections.filter( (c: Collection) => {
                    if (c.collection.indexOf("-") === -1) {
                        if(query.collection.toLowerCase().indexOf(c.collection.toLowerCase()) != -1) 
                        return c
                    } else {
                        if (query.tokenId) {
                            let coll = c.collection.split("-")[0]
                            if(query.collection.toLowerCase().indexOf(coll.toLowerCase()) != -1) return c
                        }
                    }
                })
            }
            if (query.tokenId) {
                collections = collections.filter( (c: Collection) => {
                    if(c.collection.endsWith(`-${query.tokenId}`)) return c
                })
            }

            this.response.collections = collections

        }

        return this.response

    }

    validate = (query: any): boolean => {

        const valid = ['collection','sortby', 'direction', 'tokenid']

        Object.keys(query).forEach(param => { 
            param = param.toLowerCase()
            if (!valid.includes(param)) {
                console.log(param);
                this.response.status = 400
                this.response.error = "Invalid parameter specified"
                return false
            }
        })

        return true

    }

}