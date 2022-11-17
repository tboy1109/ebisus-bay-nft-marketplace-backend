import { Row } from "./row"

export class TransferSingleRow implements Row {
    
    collection: string
    operator: string
    from: string
    to: string 
    id: number
    value: number

    constructor(collection: string, operator: string, from: string, to: string, id: number, value: number){

        this.collection = collection
        this.operator = operator
        this.from = from
        this.to = to
        this.id = id
        this.value = value

    }

    table = () => "transfer_single"

    populate(result: any): TransferSingleRow {

        this.collection = result.collection
        this.operator = result.operator
        this.from = result.from
        this.to = result.to
        this.id = result.id
        this.value = result.value

        return this
    }
}