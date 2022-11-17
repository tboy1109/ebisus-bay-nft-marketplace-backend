import DatabaseTable from '../../database/table'
import ApiResponse from '../../types/apiresponse'
import Listing from '../../types/listing'
import Api from './api'

export default class ApiListings extends Api{

    response = new ApiResponse(200, undefined)

    process = async (query: any, filtered: boolean = true): Promise<ApiResponse> => {

        if(this.validate(query)){
            this.response.listings = await this.execute(this.filter(query, filtered), this.sort(query), this.paginate(query))
        }

        return this.response

    }

    validate = (query: any): boolean => {

        const valid = ['listingid', 'collection', 'tokenid', 'seller', 'sortby', 'direction', 'state', 'page', 'pagesize', 'traits', 'tokenid', 'search', 'powertraits', 'maxprice', 'minprice']        

        Object.keys(query).forEach(param => {
            param = param.toLowerCase()
            if (!valid.includes(param)) {
                console.log(param);
                this.response.status = 400
                this.response.error = "Invalid parameter specified"
                return false
            }
        })

        if(query.sortBy){
            const validSortBy = ['listingId', 'listingTime', 'saleTime', 'price', 'rank']
            if (!validSortBy.includes(query.sortBy)) {
                this.response.status = 400
                this.response.error = "sortBy=[" + validSortBy.join(",") + "]"
                return false
            }
        }

        if(query.direction){
            const validDirection = ['asc', 'desc']
            if (!validDirection.includes(query.direction)) {
                this.response.status = 400
                this.response.error = "direction=[" + validDirection.join(",") + "]"
                return false
            }
        }

        return true

    }

    filter = (query: any, filtered: boolean = true): string => {

        const filters = []
        if(filtered){
            filters.push("invalid in (0,1)")
            filters.push(toJsonExtract('$.nft') + " is not null")
        }
        if(query.listingId){
            filters.push("id in (" + getNumberIds(query.listingId) + ")")
        }
        if(query.state){
            filters.push(getJsonState() + " in (" + getNumberIds(query.state) + ")" )
        }
        if(query.seller){
            filters.push(toJsonAddress('$.seller') + " in (" + getQuotedIds(query.seller) + ")" )
        }
        if(query.purchaser){
            filters.push(toJsonAddress('$.purchaser') + " in (" + getQuotedIds(query.purchaser) + ")" )
        }
        if(query.collection){
            filters.push(toJsonAddress('$.nftAddress') + " in (" + getQuotedIds(query.collection) + ")" )
        }
        if(query.tokenId){
            filters.push(toJsonExtract('$.nft.nftId') + " in (" + getNumberIds(query.tokenId) + ")")
        }
        if(query.traits){
            const decodedTraits = JSON.parse(query.traits.toString());
            for (const trait of Object.keys(decodedTraits)) {
                const oneormore = []
                for(const value of decodedTraits[trait]){
                    const match = { "trait_type": escape(trait), "value": escape(value) }
                    const jsonContains = toJsonContains(match, '$.nft.attributes')
                    oneormore.push(jsonContains)
                }
                filters.push("(" + oneormore.join(" or ") + ")")
            }
        }
        if(query.powertraits){
            const decodedTraits = JSON.parse(query.powertraits.toString());
            for (const trait of Object.keys(decodedTraits)) {
                const oneormore = []
                for(const value of decodedTraits[trait]){
                    const powertrait = { "trait_type": escape(trait), "value": +value }
                    const jsonContains = toJsonContains(powertrait, '$.nft.powertraits')
                    oneormore.push(jsonContains)
                }
                filters.push("(" + oneormore.join(" or ") + ")")
            }
        }
        if (query.minPrice) {
            filters.push(`${getJsonPrice()} >= ${query.minPrice}`)
        }
        if (query.maxPrice) {
            filters.push(`${getJsonPrice()} <= ${query.maxPrice}`)
        }
        return filters.length > 0 ? ' where ' + filters.join(" and ") : ''

    }

    sort = (query: any): string => {

        let sort = ''
        if(query.sortBy){
            query.sortBy = query.sortBy == 'listingId' ? 'id' : query.sortBy
            query.sortBy = query.sortBy == 'price' ? getJsonPrice() : query.sortBy
            query.sortBy = query.sortBy == 'rank' ? toJsonExtract('$.nft.rank') : query.sortBy
            query.sortBy = query.sortBy == 'listingTime' ? toJsonExtract('$.listingTime') : query.sortBy
            query.sortBy = query.sortBy == 'saleTime' ? toJsonExtract('$.saleTime') : query.sortBy
            sort = ' order by ' + query.sortBy + ' '
            sort += query.direction ? query.direction : 'asc'
            if (query.sortBy != "listingId") sort += ', id desc'
        }
        return sort

    }

    paginate = (query: any): string => {

        let limit = ' limit 100'

        const page = query.page
        const pageSize = query.pageSize
        if(page && pageSize){
            const offset = (+page - 1) * +pageSize
            limit = ' limit ' + pageSize + ' offset ' + offset
            this.response.page = +page
            this.response.pageSize = +pageSize
        }

        return limit

    }

    execute = async (filter: string, sort: string, paginate: string): Promise<Listing[]> => {

        try{

            if(this.response.pageSize){
                const totalCount = await this.selectCount(filter)
                this.response.totalCount = totalCount
                this.response.totalPages = Math.ceil(totalCount/+this.response.pageSize)
            }

            return await this.selectJson(filter + sort + paginate)

        } catch(error) {
            console.log(error.message)
        }

    }

    selectCount = async (statement: string): Promise<number> => {

        statement = 'select count(*) as total from listings' + statement
        try{

        return new Promise( (resolve, reject) => {

            Api.pool.query(statement, (error, results, fields) => {
                if (error) reject(error)

                if(results && results.length > 0){
                    resolve(results[0].total)
                }

            })
        })

        } catch(error){
            console.log(error.message)
            return 0
        }

    }

    selectJson = async (statement: string): Promise<any> => {

        statement = 'select json from listings' + statement

        return new Promise( (resolve, reject) => {

            Api.pool.query(statement, (error, results, fields) => {
                if (error) reject(error)

                const listings = []
                if(results && results.length > 0){
                    for(const result of results){
                        listings.push(JSON.parse(result.json))
                    }
                }
                resolve(listings)
            })
        })

    }

}

const escape = (value: string) => {
    return value.replace(/'/g,"\''")
}

const getNumberIds = (values: any) => {
    const numbers = values.split(",").map( (v: number) => +v)
    return numbers.join(",")
}

const getQuotedIds = (values: any) => {
    const quotedStrings = values.split(",").map( (v: string) => "'" + v.toLowerCase() + "'")
    return quotedStrings.join(",")
}

const toJsonContains = (json: object, path: string): string => {
    return "json_contains(json,'"+JSON.stringify(json)+"','"+path+"')"
}

const toJsonExtract = (path: string): string => {
    return "json_extract(json, '"+path+"')"
}

const toCommaDelimited = (values: string[]): string => {
    const quotedStrings = values.map( (v: string) => "'" + v + "'")
    return quotedStrings.join(",")
}

const getJsonState = () => {
    return "json_extract(json, '$.state')"
}

const toJsonAddress = (jpath: string) =>{
    return "lower(replace(json_extract(json, '" + jpath + "'),'\"',''))"
}

const getJsonPrice = () =>{
    return "convert(json_extract(json, '$.price'), decimal(20,8))"
}
