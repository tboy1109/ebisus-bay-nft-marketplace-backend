import mysql from 'mysql'
import DatabaseTable from "../table"
import { TaskRow } from "./row"

import datadotjson from './data.json'

export default abstract class TaskTable extends DatabaseTable {
    
    static Data = async (): Promise<any> => {
        const data = datadotjson as any[]
        for(const item of data){
            let row = new TaskRow(item.name)
            row.type = item.type
            row.cron = item.cron
            row.scheduled = item.scheduled
            row.recover = item.recover
            row.once = item.once
            row.running = item.running
            row.sort = item.sort
            this.Replace(row)
        }
    }

    static Select = async (): Promise<TaskRow[]> => {

        const statement = "select * from task order by sort asc"

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query(statement, (error, results) => {
                if (error) reject(error)

                const tasks: TaskRow[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        tasks.push(new TaskRow(result.name).populate(result))
                    }
                    resolve(tasks)
                } else{
                    resolve(undefined)
                }

            })
        })

    }

        
    static SelectByName = async (name: string): Promise<TaskRow> => {

        const statement = "select * from task where name = ?"


        return new Promise( (resolve, reject) => {

            DatabaseTable.pool.query(statement, [name], (error, results) => {
                if (error) reject(error)

                const tasks: TaskRow[] = []
                if(results && results.length > 0){
                    for(const result of results){
                        tasks.push(new TaskRow(result.name).populate(result))
                    }
                    resolve(tasks.pop())
                } else{
                    resolve(undefined)
                }

            })
        })

    }

    static Replace = async (row: TaskRow): Promise<boolean> => {

        return new Promise( (resolve, reject) => {
            DatabaseTable.pool.query('replace into task set ?', row, (error, results) => {
                if (error) reject(error)
                resolve(true)
            })
        })

    }
}

