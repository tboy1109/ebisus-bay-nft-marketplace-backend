import { utils } from 'ethers'
import Contracts from '../contract/contracts'
import Auction from '../types/auction'
import Bid from '../types/bid'
import Address from '../utils/address'
import Data from '../database/data'
import TaskStats from '../database/task/stats'
import MarketUpdate from '../market/update'

export default abstract class AuctionUpdate {

    static Now = async (stats: TaskStats): Promise<TaskStats> => {

        try {

            const auctionMap = await this.GetAuctions()

            const arrayObj =  JSON.stringify(Array.from(auctionMap.values()))

            Data.Replace( { name: 'auctions', value: arrayObj } )

        } catch (error) {
            stats.setError(error)
        }
        return stats

    }

    static GetAuctions = async (): Promise<Map<any, any>> => {

        const auctionMap = new Map<any, any>()

        const hashes = await Contracts.Auction.hashes()

        let rawAuctions = new Map()

        const BATCH_SIZE = 1;

        const arrayOfIndexes = [];
        for (let i=0; i<hashes.length; i+=BATCH_SIZE) {
            arrayOfIndexes.push(hashes.slice(i,i+BATCH_SIZE));
        }

        const newAuctions = await this.GetAuctionsThreaded(arrayOfIndexes, hashes)
        for (const auction of newAuctions) {
            auction.nft = await MarketUpdate.FromAnywhere(auction.nftAddress, auction.nftId)
            rawAuctions.set(auction.auctionId, auction);
        }

        rawAuctions = new Map([...rawAuctions].filter(([k, v]) => typeof v !== 'undefined'));
        for (const auction of rawAuctions.values()) {
            if (auctionMap.has(auction.auctionId)) {
                try {
                    const tempAuction = auction;
                    tempAuction.nft = auctionMap.get(auction.auctionId).nft
                    tempAuction.valid = auctionMap.get(auction.auctionId).valid
                    auctionMap.set(auction.auctionId, tempAuction)
                } catch (error) {
                    console.log(error);
                    auctionMap.set(auction.auctionId, auction)
                }
            } else {
                auctionMap.set(auction.auctionId, auction)
            }
        }

        return auctionMap
    }

    static GetAuctionsThreaded = async (arrayOfIndexes: any, rawAuctions: any): Promise<Auction[]> => {

        let fatArray = await Promise.all(arrayOfIndexes.map(async (indexes) => {

            return await Promise.all(indexes.map(async (i) => {

                const processedAuctions = new Array<Auction>()
                try{

                    const rawAuction = await Contracts.Auction.auctions(i)
                    const minimumBid = await Contracts.Auction.minimumBid(i)

                    if (Address.valid(rawAuction.nft)) {

                        let state = 3
                        if (rawAuction.started && !rawAuction.ended) { state = 0 }
                        else if (rawAuction.ended && rawAuction.isValue) { state = 1 }
                        else if (rawAuction.ended) { state = 2 }

                        const bidHistoryList = new Array<Bid>()
                        if (state != 3) {
                            const bidHistory = await Contracts.Auction.getAllBids(i)
                            for (const item of bidHistory) {
                                const bid = new Bid()
                                bid.bidder = item.bidder
                                bid.price = utils.formatEther(item.value)
                                bid.created = item.created.toNumber()
                                bid.withdrawn =  item.hasWithdrawn
                                bidHistoryList.push(bid)
                            }
                            bidHistoryList.sort((a, b) => Number(b.price) - Number(a.price));
                        }

                        const processed = new Auction()
                        processed.auctionId = rawAuction.hashId.toNumber()
                        processed.auctionHash = i
                        processed.nftId = rawAuction.nftId.toNumber()
                        processed.seller = rawAuction.seller
                        processed.nftAddress = rawAuction.nft
                        processed.highestBidder = rawAuction.highestBidder
                        processed.highestBid = utils.formatEther(rawAuction.highestBid)
                        processed.minimumBid = utils.formatEther(minimumBid)
                        processed.endAt = rawAuction.endAt.toNumber() * 1000
                        processed.state = state
                        processed.valid = true
                        processed.bidHistory = bidHistoryList
                        processedAuctions.push(processed)

                    }
                } catch(error) {
                    console.log(`error on index ${i}`)
                    console.log(error);
                }
                return processedAuctions
            }))

        }))

        fatArray = [].concat.apply([], fatArray)
        return [].concat.apply([], fatArray)

    }



}