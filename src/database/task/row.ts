import dayjs from "dayjs"
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export class TaskRow {

    name: string
    cron: string
    type: TaskRow.Type   
    once: boolean 
    recover: boolean
    scheduled: boolean
    
    errors?: string

    runs?: number
    running?: number

    duration?: number
    duration_min?: number
    duration_max?: number
    duration_avg?: number
    duration_ttl?: number

    sort?: number

    constructor(name: string) {
        this.name = name
    }

    populate(result: any): TaskRow {

        this.type = result.type
        this.cron = result.cron

        this.sort = result.sort
        this.errors = result.errors
        this.duration = result.duration
        this.duration_min = result.duration_min
        this.duration_max = result.duration_max
        this.duration_avg = result.duration_avg
        this.duration_ttl = result.duration_ttl

        this.runs = result.runs
        this.running = result.running

        this.once = result.once === 0 ? false : true
        this.recover = result.recover === 0 ? false : true
        this.scheduled = result.scheduled === 0 ? false : true
        return this

    }

    errorCount = (): number => {
        return JSON.parse(this.errors).length
    }

    durationAvg = (): string => {
        return dayjs.duration(this.duration_avg, 'seconds').format('mm:ss')
    }

    onSort = (t1: TaskRow, t2: TaskRow) => {
        var s1 = new Number(t1.sort)
        var s2 = new Number(t2.sort)
        if (s1 > s2) { return -1 }
        if (s1 < s2) { return 1 }
        return 0
    }

}

export namespace TaskRow {

    export enum Name {
        Market,
        Collection,
        Auction,
        Calculate
    }

    export enum Type {
        Core,
        Admin
    }
}

export const Market = TaskRow.Name[TaskRow.Name.Market]
export const Collection = TaskRow.Name[TaskRow.Name.Collection]
export const Auction = TaskRow.Name[TaskRow.Name.Auction]
export const Calculate = TaskRow.Name[TaskRow.Name.Calculate]
