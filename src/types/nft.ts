export default class Nft {

    key: string
    nftId: number
    nftAddress: string

    edition?: number
    name?: string
    image?: string
    original_image?: string
    description?: string
    score?: number
    rank?: number
    attributes?: Attribute[]
    properties?: Attribute[]
    powertraits?: Attribute[]
    simplifiedAttributes?: {}

    constructor(nftAddress: string, nftId: number) {

        this.nftId = nftId
        this.nftAddress = nftAddress
        //this.key = nftAddress.toLowerCase().concat(nftId.toString())

    }

    populate?(json: object) {

        return this
    }

    populateFile?(json: object) {

        return this

    }

}
