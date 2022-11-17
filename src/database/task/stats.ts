import dayjs from "dayjs"
import duration from 'dayjs/plugin/duration'
import { TaskRow } from "./row"

dayjs.extend(duration)

export default class TaskStats {
    taskRow: TaskRow

    seconds: number
    errors: object[] = []

    constructor(row: TaskRow) {
        this.taskRow = row
        return this
    }

    start = (): TaskStats => {

        this.seconds = dayjs().unix()

        this.taskRow.running = 1
        console.log(">", this.taskRow.name)
        return this

    }

    stop = (): TaskStats => {
   
        this.taskRow.runs++
        this.taskRow.running = 0
        this.taskRow.duration = dayjs().unix() - this.seconds
        this.taskRow.duration_ttl += this.taskRow.duration
        this.taskRow.duration_avg = this.taskRow.duration_ttl / this.taskRow.runs
        this.taskRow.duration_min = this.taskRow.duration_min == 0 ? this.taskRow.duration : this.taskRow.duration < this.taskRow.duration_min ? this.taskRow.duration : this.taskRow.duration_min
        this.taskRow.duration_max = this.taskRow.duration > this.taskRow.duration_max ? this.taskRow.duration : this.taskRow.duration_max
        this.taskRow.errors = JSON.stringify(this.errors)
        console.log("<", this.taskRow.name)
        return this
    
    }

    setError = (error: any) => {
        this.errors.push({ message: error.message })
        //console.log(error.message)
    }
}