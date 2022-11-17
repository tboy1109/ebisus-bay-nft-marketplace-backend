import mysql from 'mysql'
import DatabaseTable from '../table'

export default abstract class ListingTable extends DatabaseTable {

    static Collections = async (): Promise<{address: string, is1155: boolean, count: number}[]> => {

        const statement = "SELECT lower(replace(json_extract(JSON, '$.nftAddress'),'\"','')) `nftAddress`, MAX(json_extract(JSON, '$.is1155')) `is1155`, COUNT(*) `listings` FROM listings GROUP BY nftAddress ORDER BY listings desc"
        
        return new Promise( (resolve, reject) => {
        
            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const nfts: any[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        const is1155 = result.is1155 == 'true' ? true : false
                        nfts.push({address: result.nftAddress, is1155, count: result.listings})
                    }
                    resolve(nfts)
                } else{
                    resolve(undefined)
                }

            })
        })
    }

}