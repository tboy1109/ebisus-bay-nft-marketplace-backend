import { utils } from 'ethers'
import Contracts from '../contract/contracts'
import Clisting from './clisting'
import { Invalid } from './invalid'

import Nft from './nft'
import { State } from './state'

export default class Listing {

    listingId: number
    nftId: number
    nftAddress: string
    nftKey: string

    listingTime?: number
    saleTime?: number
    endingTime?: number

    seller?: string
    purchaser?: string

    price?: string
    royalty?: string
    fee?: string

    is1155?: boolean
    state?: number

    invalid?: number = undefined
    valid?: boolean = undefined

    nft?: Nft = undefined

    constructor(listingId: number) {

        this.listingId = listingId

    }

    activateWeb678 = async (): Promise<Nft> => {

        let nft = new Nft(this.nftAddress, this.nftId)
        nft.name = `Metaverse Pixel ${this.nftId}`
        nft.description = ""

        try{ 
            const contract = Contracts.Nft(this.nftAddress, false)
            const propertyHash = await contract.tokenURI(this.nftId)
            const ipfsPropertyUri = `https://gateway.ebisusbay.com/ipfs/${propertyHash}`
            nft.image = ipfsPropertyUri
            nft.original_image = ipfsPropertyUri
            console.log("WEB-678: property assignment located")
        } catch(error) {
            const ipfsMissingUri = `https://gateway.ebisusbay.com/ipfs/QmeSJTbQQAsEvg6fYCMnHRYHecW6g7p3f5aar9txphyfau`
            nft.image = ipfsMissingUri
            nft.original_image = ipfsMissingUri
            console.log("WEB-678: property assignment missing")
        }

        return nft
    }

    buildNftKey(nftAddress: string, nftId: number){

        this.nftId = nftId
        this.nftAddress = nftAddress

    }

    setInvalid?(invalid: Invalid){
        this.invalid = invalid
        this.valid = (Invalid.False === invalid || Invalid.Unknown == invalid) ? true : false
    }

    getBucketKey(){
        return 'files/' + this.nftAddress.toLowerCase() + "/metadata/" + this.nftId + ".json"
    }

    populateEvent?(clisting: Clisting) {

        this.buildNftKey(clisting.getNftAddress(), clisting.getNftId())

        this.listingTime = clisting.getListingTime()
        this.saleTime = clisting.getSaleTime()
        this.endingTime = clisting.getEndingTime()

        this.listingId = clisting.getListingId()
        this.state = clisting.getState()

        this.seller = clisting.getSeller()
        this.purchaser = clisting.getPurchaser()

        this.fee = clisting.getFee()
        this.price = clisting.getPrice()
        this.royalty = clisting.getRoyalty()

        this.is1155 = clisting.getIs1155()

        this.setInvalid(Invalid.Unknown)

        return this
    }

    toJsonSummary?(): Listing {

        let nft: Nft
        if(this.nft !== undefined){
            nft = new Nft(this.nft.nftAddress, this.nft.nftId)
            nft.name = this.nft.name
            nft.image = this.nft.image
        }

        const summary = new Listing(this.listingId)
        summary.state = this.state
        summary.nft = nft

        return summary

    }



}