export default class TokenRow {

    id: number
    address: string
    owner: string
    uri: string

    constructor(id: number, address: string){
        this.id = id
        this.address = address
    }

    populate(result: any): TokenRow {

        this.id = result.id
        this.address = result.address
        this.owner = result.owner
        this.uri = result.uri
        return this

    }

}