

export default class Purchaser {
    purchaser?: string

    constructor(purchaser: string) {
        this.purchaser = purchaser
    }

    populateFile?(json: Object) {

        this.purchaser = json['purchaser']

        return this

    }
}
