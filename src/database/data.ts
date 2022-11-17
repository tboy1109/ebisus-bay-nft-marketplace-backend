import mysql from 'mysql'

import TaskTable from './task/table'
import DatabaseTable from './table'

export default abstract class Data extends DatabaseTable{

    static Load = async (): Promise<any> => {

        try {

            await TaskTable.Data()
            //await NftExtTable.Data()

        } catch (error) {
            console.log(error.message)
        }

    }

    static Select = async (args: object): Promise<any> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query('select * from data where ?', args, function (error, results, fields) {
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
            DatabaseTable.pool.query('replace into data set ?', row, (error, results, fields) => {
                if (error){
                    console.log(error.message)
                    reject(false)
                } else {
                    resolve(results)
                }
            })
        })

    }

}