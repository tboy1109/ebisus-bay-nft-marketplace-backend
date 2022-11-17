import Data from "../../database/data"
import ApiResponse from "../../types/apiresponse"

export default class ApiMarketData {

    response = new ApiResponse(200, undefined)

    process = async (query: any) => {

        if(this.validate(query)){

            const results = await Data.Select({name: 'marketdata'})
            const marketdata = JSON.parse(results[0].value)
            this.response.marketdata = marketdata

        }

        return this.response

    }

    validate = (query: any): boolean => {

        const valid = ['']

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