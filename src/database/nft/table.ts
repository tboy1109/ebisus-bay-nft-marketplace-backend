import DatabaseTable from '../table'
import NftRow from './row'

export default abstract class NftTable extends DatabaseTable {
    
    static DropDown = async (): Promise<NftRow[]> => {

        const statement = "select nft.address, COALESCE(nft_ext.name_ext, nft.name) `name` from nft left join nft_ext using (address) order by name asc"

        return new Promise( (resolve, reject) => {

            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const nfts: NftRow[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        nfts.push(new NftRow(result.address).populate(result))
                    }
                    resolve(nfts)
                } else{
                    resolve(undefined)
                }

            })
        })

    }

    static Replaces = async (rows: object[]): Promise<any[]> => {

        const promises = []
        for(const row of rows){
            promises.push(new Promise( (resolve, reject) => { 
                DatabaseTable.pool.query('replace into nft set ?', row, (error, results) => {
                    if (error) reject(error)
                    resolve(results)
                })
            })) 
        }
        const answers = await Promise.all(promises)
        return answers

    }

    static Replace = async (row: object): Promise<any> => {

        return new Promise( (resolve, reject) => {

            DatabaseTable.pool.query('replace into nft set ?', row, (error, results) => {
                if (error) reject(error)
                resolve(results)
            })
        })

    }

    static UpdateExt = async (): Promise<any> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query("insert into nft_ext (address) select address from nft on duplicate key update nft_ext.address = nft.address", (error, results) => {
                if (error) reject(error)
                resolve(results)
            })
        })

    }

    

}