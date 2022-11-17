import dayjs from "dayjs"
import duration from 'dayjs/plugin/duration'

import { State } from "./state"

dayjs.extend(duration)

export class ResultStats {
    
    state: number
    stateName: string
    seconds: number
    updates: number
    errors: number
    valid: number
    total: number
    duration: string

    stateLink?: string

    constructor(state: number){
        this.state = state
        this.seconds = dayjs().unix()
        this.stateName = State[state]
        this.updates = 0
        this.errors = 0
        this.valid = 0
        this.total = 0
        this.duration = undefined
    }

    stop = (): ResultStats => {
   
        this.duration = dayjs.duration(dayjs().unix() - this.seconds,'seconds').format('mm:ss')
        return this
    
    }
}