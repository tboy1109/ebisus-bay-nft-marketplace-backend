import { utils } from "ethers"
import Address from "../utils/address"
import { State } from "./state"

export default class Clisting {

    obj: object
    state: State

    constructor(obj: object, state: State){
        this.obj = obj
        this.state = state
    }

    isValid = () => {
        return Address.valid(this.getNftAddress())
    }

    getListingId = () =>{
        return this.obj['listingId'].toNumber()
    }

    getNftId = () =>{
        return this.obj['nftId'].toNumber()
    }

    getListingTime = () =>{
        return this.obj['listingTime'].toNumber()
    }

    getSaleTime = () =>{
        return this.obj['saleTime'].toNumber()
    }

    getEndingTime = () =>{
        return this.obj['endingTime'].toNumber()
    }

    getSeller = () =>{
        return this.obj['seller']
    }

    getPurchaser = () =>{
        return this.obj['purchaser']
    }

    getNftAddress = () =>{
        return this.obj['nft']
    }

    getFee = () =>{
        return utils.formatEther(this.obj['fee'])
    }

    getPrice = () =>{
        return utils.formatEther(this.obj['price'])
    }

    getRoyalty = () =>{
        return utils.formatEther(this.obj['royalty'])
    }

    getIs1155 = () =>{
        return this.obj['is1155']
    }

    getState = () =>{
        return this.state
    }

}