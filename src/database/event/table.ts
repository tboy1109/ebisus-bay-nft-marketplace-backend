import DatabaseTable from "../table"
import { Row } from './row'

export default abstract class EventTable extends DatabaseTable {
    
    static Select = async (row: any): Promise<any[]> => {

        const statement = "select * from " + row.table


        return new Promise( (resolve, reject) => {

            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const events: any[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        events.push(row.populate(result))
                    }
                    resolve(events)
                } else{
                    resolve(undefined)
                }

            })
        })

    }

    static Replace = async (row: Row): Promise<boolean> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query('replace into ' + row.table() + ' set ?', row, (error) => {
                if (error) reject(error)
                resolve(true)
            })
        })

    }
}

