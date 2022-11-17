import { Row } from "./row"

export class TransferRow implements Row {
    
    collection: string
    from: string
    to: string 
    token: number

    constructor(collection: string, from: string, to: string, token: number){

        this.collection = collection
        this.from = from
        this.to = to
        this.token = token
    }

    table = () => "transfer"

    populate(result: any): any {

        this.collection = result.collection
        this.from = result.from
        this.to = result.to
        this.token = result.token

        return this
    }
}