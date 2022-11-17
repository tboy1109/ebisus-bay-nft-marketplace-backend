
export default class Seller {
    seller?: string

    constructor(seller: string) {
        this.seller = seller
    }

    populateFile?(json: object) {

        this.seller = json['seller']

        return this

    }
}
