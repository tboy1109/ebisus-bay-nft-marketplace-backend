import mysql from 'mysql'

import dayjs from 'dayjs'
import { createHash } from 'crypto'
import Listing from '../types/listing'
import { State } from '../types/state'
import DatabaseTable from './table'

export default abstract class Database extends DatabaseTable {

    static Health = async (): Promise<any> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query("select 'healthcheck'", function (error) {
                if (error){
                    reject(error)
                } else {
                    resolve("available")
                }
            })
        })
    
    }

    static SyncListing = async (listing: Listing): Promise<number> => {

        return await this.SyncListings([listing], true)

    }

    static SyncListings = async (listings: Listing[], isEvent: boolean = false): Promise<number> => {

        let counter = 0

        const pool = mysql.createPool(config)

        const donePromises = listings.map( async (listing: Listing) => {

            if(listing !== undefined) {

                const row = { id: listing.listingId }
                const selectResult = await this.Select(row)

                const json = JSON.stringify(listing)
                const etag = entityTag(json)

                let check_cnt: number = 1
                let check_ts: number = dayjs().unix()
                if(selectResult.length > 0){
                    check_cnt = selectResult[0].check_cnt + 1
                    check_ts = dayjs().unix()
                    // if etag hasn't changed, we can return
                    if(etag === selectResult[0].etag) {
                        //const updateArgs = [ check_cnt , check_ts, listing.listingId ]
                        //const updateResult = await this.Update(updateArgs, pool)
                        return
                    }
                }

                const curr_sync_cnt: number = selectResult.length > 0 ? selectResult[0].sync_cnt : 0
                const curr_event_cnt: number = selectResult.length > 0 ? selectResult[0].event_cnt : 0

                const curr_sync_ts: number = selectResult.length > 0 ? selectResult[0].sync_ts : undefined
                const curr_event_ts: number = selectResult.length > 0 ? selectResult[0].event_ts : undefined

                const sync_cnt = !isEvent ? curr_sync_cnt + 1 : curr_sync_cnt
                const event_cnt = isEvent ? curr_event_cnt + 1 : curr_event_cnt

                const sync_ts = !isEvent ? dayjs().unix() : curr_sync_ts
                const event_ts = isEvent ? dayjs().unix() : curr_event_ts

                const entry = { id: listing.listingId, invalid: listing.invalid, etag, json, sync_cnt, event_cnt, check_cnt, sync_ts, event_ts, check_ts }
                const replaceResult = await this.Replace(entry)

                counter++
            }

        })

        await Promise.all(donePromises)

        pool.end( (error) => {
            if(error){
                console.log(error)
            }
        })

        return counter
    }

    static Select = async (args: object): Promise<any> => {

        return new Promise( (resolve, reject) => {
            Database.pool.query('select * from listings where ?', args, function (error, results, fields) {
                if (error){
                    console.log(error.message)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })

    }

    static Update = async (args: any[]): Promise<any> => {

        return new Promise( (resolve, reject) => {
            Database.pool.query('update listings set check_cnt = ?, check_ts = ? where id = ?', args, function (error, results, fields) {
                if (error){
                    console.log(error.message)
                    reject(error)
                } else {
                    resolve(results)
                }
            })
        })

    }

    static Replace = async (row: object): Promise<any> => {

        return new Promise( (resolve, reject) => {
            const query = Database.pool.query('replace into listings set ?', row, (error, results, fields) => {
                if (error){
                    console.log(error.message)
                    reject(false)
                } else {
                    resolve(results)
                }
            })
        })

    }

    static SelectListings = async (): Promise<Listing[]> => {

        const filters = new Array<string>()
        filters.push("invalid IN (0,1)")
        //filters.push(toJsonExtract('$.nft') + " is not null")

        const statement = "select json from listings" + (filters.length > 0 ? " where " + filters.join(" and ") : "")
       
        return new Promise( (resolve, reject) => {


            DatabaseTable.pool.query(statement, (error, results, fields) => {
                if (error) reject(error)

                const listings = []
                if(results && results.length > 0) for(const result of results){
                    listings.push(JSON.parse(result.json))
                }
                resolve(listings)

            })

        })

    }

    static AdminStateCount = async (state: State): Promise<number> => {

        const filters = new Array<string>()
        filters.push(toJsonExtract('$.state') + " in (" + state + ")")
        return this.AdminCount(filters)

    }

    
    static AdminStateCollectionCount = async (state: State, collection: string): Promise<number> => {

        const filters = new Array<string>()
        filters.push(toJsonExtract('$.state') + " in (" + state + ")")
        filters.push(toJsonAddress('$.nftAddress') + " in (" + getQuotedIds(collection) + ")" )
        return this.AdminCount(filters)

    }

    static AdminStateValidCount = async (state: State): Promise<number> => {

        const filters = new Array<string>()
        filters.push(toJsonExtract('$.state') + " in (" + state + ")")
        filters.push("invalid in (0,1)")
        return this.AdminCount(filters)                

    }

    static AdminStateValidCollectionCount = async (state: State, collection: string): Promise<number> => {

        const filters = new Array<string>()
        filters.push(toJsonExtract('$.state') + " in (" + state + ")")
        filters.push("invalid in (0,1)")
        filters.push(toJsonAddress('$.nftAddress') + " in (" + getQuotedIds(collection) + ")" )
        return this.AdminCount(filters)

    }

    static AdminCount = async (filters: Array<string>): Promise<number> => {

    
        const statement = "select count(*) `count` from listings" + (filters.length > 0 ? " where " + filters.join(" and ") : "")
        return new Promise( (resolve, reject) => {
            //console.log(statement)
            Database.pool.query(statement, (error, results) => {
                if (error) reject(error)
                if(results && results.length > 0){
                    resolve(results[0].count)
                } else{
                    resolve(0)
                }
            })
        })

    }

    static AdminListing = async (listingId: number): Promise<Listing> => {

        const filters = new Array<string>()
        filters.push(`id = ${listingId}`)

        const statement = "select json from listings" + (filters.length > 0 ? " where " + filters.join(" and ") : "")

        return new Promise( (resolve, reject) => {
            
            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const listings = new Array<Listing>()
                if(results && results.length > 0){
                    for(const result of results){
                        listings.push(JSON.parse(result.json))
                    }
                    resolve(listings.pop())
                } else{
                    resolve(undefined)
                }

            })
        })

    }

    static AdminListingsForCollection = async (state: State, collection: string): Promise<Listing[]> => {

        const filters = new Array<string>()
        filters.push(toJsonExtract('$.state') + " in (" + state + ")")
        filters.push(toJsonAddress('$.nftAddress') + " in (" + getQuotedIds(collection) + ")" )

        const statement = "select json from listings" + (filters.length > 0 ? " where " + filters.join(" and ") : "")

        return new Promise( (resolve, reject) => {
            
            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const listings = new Array<Listing>()
                if(results && results.length > 0){
                    for(const result of results){
                        let jsonListing = JSON.parse(result.json)
                        listings.push(jsonListing)
                    }
                    resolve(listings)
                } else{
                    resolve(undefined)
                }

            })
        })

    }

    static InvalidateListing = async (args: any[]): Promise<any> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query('update listings set invalid = ? where id = ?', args, function (error, results, fields) {
                if (error) reject(error)

                resolve(results)


            })
        })

    }

}

const entityTag = (entity: string | Buffer): string => {

    if (entity.length === 0) {

        return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'

    } else {

        const hash = createHash('sha1')
            .update(entity as string, 'utf8')
            .digest('base64')
            .substring(0, 27)

        const len = bytesize(entity)

        return '"' + len.toString(16) + '-' + hash + '"'

    }
}

const toJsonAddress = (jpath: string) =>{
    return "lower(replace(json_extract(json, '" + jpath + "'),'\"',''))"
}

const toJsonExtract = (path: string): string => {
    return "json_extract(json, '"+path+"')"
}

const getQuotedIds = (values: any) => {
    const quotedStrings = values.split(",").map( (v: string) => "'" + v.toLowerCase() + "'")
    return quotedStrings.join(",")
}

const bytesize = (entity): number => {
    return (typeof entity === 'string') ? Buffer.byteLength(entity, 'utf8') : entity.length
}

const config = {
    pool: process.env.AWS_MYSQL_POOL,
    host: process.env.AWS_MYSQL_HOST,
    user: process.env.AWS_MYSQL_USER,
    password: process.env.AWS_MYSQL_PASSWORD,
    database: process.env.AWS_MYSQL_DATABASE
}