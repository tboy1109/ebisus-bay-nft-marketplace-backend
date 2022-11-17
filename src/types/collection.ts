import { BigNumber } from 'ethers'

export default class Collection {
    collection: string

    numberActive?: any = 0
    numberOfSales?: any = 0

    floorPrice?: any = null
    totalVolume?: any = BigNumber.from("0")
    totalRoyalties?: any = BigNumber.from("0")
    averageSalePrice?: any = BigNumber.from("0")

    nftId?: undefined 
    is1155?: undefined

    constructor(collection: string = undefined) {
        this.collection = collection
    }

    populateFile?(json: object) {
        this.collection = json['collection']

        return this
    }
}
