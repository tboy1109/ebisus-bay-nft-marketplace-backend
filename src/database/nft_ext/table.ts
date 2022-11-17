import mysql from 'mysql'
import DatabaseTable from '../table'
import NftExtRow from './row'

import datadotjson from './data.json'

export default abstract class NftExtTable extends DatabaseTable {
    
    static Data = async (): Promise<any> => {
        const data = datadotjson as any[]
        for(const item of data){
            let row = new NftExtRow(item.address)
            row.listable = item.listable
            row.multi_token = item.multiToken
            row.name_ext = item.name
            row.on_chain = item.onChain        
            row.verified = item.metadata.verified
            row.max_supply = item.metadata.maxSupply
            row.slug = item.metadata.slug
            row.description = item.metadata.description
            row.avatar = item.metadata.avatar
            row.card = item.metadata.card
            row.banner = item.metadata.banner
            row.website = item.metadata.website
            row.discord = item.metadata.discord
            row.gitbook = item.metadata.gitbook
            row.medium = item.metadata.medium
            row.telegram = item.metadata.telegram
            row.twitter = item.metadata.twitter
            this.Replace(row)
        }
    }

    static Select = async (): Promise<NftExtRow[]> => {

        const statement = "select * from nft_ext order by name asc"

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const nfts: NftExtRow[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        nfts.push(new NftExtRow(result.address).populate(result))
                    }
                    resolve(nfts)
                } else{
                    resolve(undefined)
                }
            })
        })

    }

    static Replace = async (row: object): Promise<any> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query('replace into nft_ext set ?', row, (error, results) => {
                if (error) reject(error)
                resolve(results)
            })
        })

    }

}