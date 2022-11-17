import Database from '../database/database'
import Contracts from '../contract/contracts'

import Listing from '../types/listing'
import { Listed, Sold } from '../types/event'
import { Cancelled, State } from '../types/state'
import MarketUpdate from './update'
import { BigNumber, Contract } from 'ethers'

export default abstract class MarketListen {

    static marketListener: Contract

    static Now = async () => {

        this.marketListener = Contracts.Marketplace

        this.marketListener.on(Listed, async (listingId: BigNumber) => {
            const id = listingId.toNumber()
            const contractListing = await MarketUpdate.GetContractListingState(id, State.Active)
            const marketListing = await MarketUpdate.FromContractListing(contractListing)
            const successful = await SyncAndPublish(marketListing)
            console.log("Listed")
        })

        this.marketListener.on(Sold, async (listingId: BigNumber) => {
            const id = listingId.toNumber()
            const contractListing = await MarketUpdate.GetContractListingState(id, State.Complete)
            const marketListing = await MarketUpdate.FromContractListing(contractListing)
            const successful = await SyncAndPublish(marketListing)
            console.log("Sold")
        })

        this.marketListener.on(Cancelled, async (listingId: BigNumber) => {
            const id = listingId.toNumber()
            const contractListing = await MarketUpdate.GetContractListingState(id, State.Cancelled)
            const marketListing = await MarketUpdate.FromContractListing(contractListing)
            const successful = await SyncAndPublish(marketListing)
            console.log("Cancelled")
        })

        // TODO: move this to the appropraite database file. only want event listeners in here
        const SyncAndPublish = async (marketListing: Listing): Promise<boolean> => {
            let success = false
            if(marketListing !== undefined){
                await Database.SyncListing(marketListing)
                success = true
            }
            return success
        }

    }

}