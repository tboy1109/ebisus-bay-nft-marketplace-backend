import mysql from 'mysql'
import DatabaseTable from '../table'
import TokenRow from './row'

export default abstract class TokenTable extends DatabaseTable {
    
    static Select = async (): Promise<TokenRow[]> => {

        const statement = "select * from token"
        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const tokens: TokenRow[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        tokens.push(new TokenRow(result.id, result.address).populate(result))
                    }
                    resolve(tokens)
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
                DatabaseTable.pool.query('replace into token set ?', row, (error, results) => {
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
            DatabaseTable.pool.query('replace into token set ?', row, (error, results) => {
                if (error) reject(error)
                resolve(results)
            })
        })

    }

}