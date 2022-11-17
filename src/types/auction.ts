import Nft from "./nft";

export default class Auction {

    auctionId?: number
    auctionHash?: any

    nftId?: number
    nft?: Nft

    seller?: string
    nftAddress?: string
    highestBidder?: string

    highestBid?: any
    minimumBid?: any
    bidHistory?: any[]

    endAt?: number
    state?: number
    valid?: boolean

}