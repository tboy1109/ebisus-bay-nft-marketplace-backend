
import cron, { ScheduledTask } from 'node-cron'
import AuctionUpdate from "../auction/update"
import CalculateUpdate from "../calculate/update"
import { TaskRow } from "../database/task/row"
import TaskTable from "../database/task/table"
import TaskStats from '../database/task/stats'
import CollectionListen from '../collection/listen'
import CollectionUpdate from '../collection/update'
import MarketListen from '../market/listen'
import MarketUpdate from '../market/update'

export default abstract class CronSchedule {

    static Tasks = new Map<string, { task: TaskRow, scheduledTask: ScheduledTask}>()

    static Install = async () => {
        
        await TaskTable.Data()
        const rows = await TaskTable.Select()
        for(const row of rows){

            let opts = { scheduled: row.scheduled, recoverMissedExecutions: row.recover }
            
            const scheduledTask = cron.schedule(row.cron, async (now: Date): Promise<any> => {

                let stats = new TaskStats(await TaskTable.SelectByName(row.name))
                if(stats.taskRow.running == 0){

                    stats.start()
                    if(stats.taskRow.once) {
                        scheduledTask.stop()
                        stats.taskRow.scheduled = false
                    }
                    await TaskTable.Replace(stats.taskRow)
                    this.Tasks.set(stats.taskRow.name, { task: stats.taskRow, scheduledTask} )
                    
                    try{
                        stats = await this.fire[stats.taskRow.name].call(this, stats)
                    } catch (error){
                        stats.setError(error)
                    }

                    stats.stop()
                    await TaskTable.Replace(stats.taskRow)
                } 
                
            }, opts)


            this.Tasks.set(row.name, { task: row, scheduledTask} )
        }
    }

    static Market = async (stats: TaskStats): Promise<TaskStats> => {

        try{
            stats = await MarketUpdate.Now(stats)
        } catch(error) {
            stats.setError(error)
        }
        return stats

    }

    static Collection = async (stats: TaskStats): Promise<TaskStats> => {

        try{
            stats = await CollectionUpdate.Now(stats)
        } catch(error) {
            stats.setError(error)
        }
        return stats

    }

    static Auction = async (stats: TaskStats): Promise<TaskStats> => {

        try{
            return await AuctionUpdate.Now(stats)
        } catch(error) {
            stats.setError(error)
        }
        return stats

    }

    static Calculate = async (stats: TaskStats): Promise<TaskStats> => {

        try{
            return await CalculateUpdate.Now(stats)
        } catch(error) {
            stats.setError(error)
        }
        return stats
        
    }

    static fire = {
        Market: this.Market, Collection: this.Collection, Auction: this.Auction, Calculate: this.Calculate
    }

}