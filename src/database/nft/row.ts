export default class NftRow {

    address: string
    owner: string
    name: string
    symbol: string
    total_supply: number


    max_supply: number
    max_mint_amount: number
    base_extension: string
    not_revealed_uri: string

    paused: boolean
    revealed: boolean

    cost: any
    balance_of_owner: any
    wallet_of_owner: string

    constructor(address: string){
        this.address = address
    }

    populate(result: any) {

        this.owner = result.owner
        this.name = result.name
        this.symbol = result.symbol
        this.total_supply = result.total_supply
        this.max_supply = result.max_supply
        this.max_mint_amount = result.max_mint_amount
        this.base_extension = result.base_extension
        this.not_revealed_uri = result.not_revealed_uri
    
        this.paused = result.paused
        this.revealed = result.revealed
    
        this.cost = result.cost
        this.balance_of_owner = result.balance_of_owner
        this.wallet_of_owner = result.wallet_of_owner

        return this
    }

}
