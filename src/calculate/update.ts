import { utils, BigNumber } from "ethers";
import Data from "../database/data";
import Database from "../database/database";
import TaskStats from "../database/task/stats";
import Collection from "../types/collection";
import Listing from "../types/listing";
import { State } from "../types/state";
import Address from "../utils/address";

import v1MarketdataFile from '../data/v1/marketdata.json'
import v1CollectionsFile from '../data/v1/collections.json'
import Marketdata from "../types/marketdata"

const v1Marketdata: Marketdata = v1MarketdataFile as Marketdata
const v1Collections: Collection[] = v1CollectionsFile as Collection[]

export default abstract class CalculateUpdate {

    static Now = async (stats: TaskStats): Promise<TaskStats> => {

        try {

            const listings = await Database.SelectListings()

            const marketdata = this.MarketDataTotals(listings)
            Data.Replace( { name: 'marketdata', value: JSON.stringify(marketdata) } )

            const collections = this.wtf(listings)
            Data.Replace( { name: 'collections', value: JSON.stringify(collections) } )

        } catch (error) {
            stats.setError(error)
        }
        return stats
    }

    
    static MarketDataTotals = (listings: Listing[]) => {

        const active = listings.filter( (l: Listing) => l.state === State.Active).length
        const complete = listings.filter( (l: Listing) => l.state === State.Complete).length
        const cancelled = listings.filter( (l: Listing) => l.state === State.Cancelled).length

        const marketdata = new Marketdata()
        marketdata.totalFees = utils.parseEther(v1Marketdata.totalFees)
        marketdata.totalVolume = utils.parseEther(v1Marketdata.totalVolume)
        marketdata.totalSales = BigNumber.from(v1Marketdata.totalSales).add(BigNumber.from(complete))
        marketdata.totalActive = BigNumber.from(active)
        marketdata.totalCancelled = BigNumber.from(v1Marketdata.totalCancelled).add(BigNumber.from(cancelled))

        for (const listing of listings) {
            if (State.Complete === listing.state) {
                marketdata.totalVolume = marketdata.totalVolume.add(utils.parseEther(listing.price));
                marketdata.totalFees = marketdata.totalFees.add(utils.parseEther(listing.fee))
            }
        }
        marketdata.totalFees = utils.formatEther(marketdata.totalFees)
        marketdata.totalVolume = utils.formatEther(marketdata.totalVolume)
        marketdata.totalSales = marketdata.totalSales.toString()
        marketdata.totalActive = marketdata.totalActive.toString()
        marketdata.totalCancelled = marketdata.totalCancelled.toString()

        return marketdata

    }

    static CollectionTotals = (listings: Listing[]): Collection[] => {

        const current = this.CurrenctCollectionTotals(listings)
        const overall = this.PriorCollectionTotals(current)
        return overall

    }

    static CurrenctCollectionTotals = (listings: Listing[]): Map<string, Collection> => {

        const collections = new Map<string, Collection>()
        for (const listing of listings) {
            const nftAddress = listing.nftAddress
            if (!Address.valid(nftAddress)) continue

            let collection: Collection
            if (!collections.has(nftAddress)) {
                collection = new Collection(nftAddress)
            } else {
                collection = collections.get(nftAddress)
            }

            if (State.Active === listing.state) {
                if (collection.floorPrice == null) {
                    collection.floorPrice = utils.parseEther(listing.price)
                }
                else if (collection.floorPrice.gt(utils.parseEther(listing.price))) {
                    collection.floorPrice = utils.parseEther(listing.price)
                }
                collection.numberActive += 1
            }
            else if (State.Complete === listing.state) {
                collection.totalVolume = collection.totalVolume.add(utils.parseEther(listing.price))
                collection.totalRoyalties = collection.totalRoyalties.add(utils.parseEther(listing.royalty))
                collection.numberOfSales += 1
            }

            if (collection.numberOfSales > 0) {
                collection.averageSalePrice = collection.totalVolume.div(BigNumber.from(collection.numberOfSales))
            }

            collections.set(nftAddress, collection)
        }

        for (const [nftAddress, collection] of collections) {
            if (collection.floorPrice) {
                collection.floorPrice = utils.formatEther(collection.floorPrice)
            }
            collection.numberActive = collection.numberActive.toString()
            collection.numberOfSales = collection.numberOfSales.toString()
            collection.totalVolume = utils.formatEther(collection.totalVolume)
            collection.totalRoyalties = utils.formatEther(collection.totalRoyalties)
            collection.averageSalePrice = utils.formatEther(collection.averageSalePrice)
        }

        return collections
    }

    static PriorCollectionTotals = (current: Map<string, Collection>): Collection[] => {

        const v1CollectionMap = new Map<string, Collection>()
        v1Collections.forEach((c: Collection) => {
            v1CollectionMap.set(c.collection, Object.assign(new Collection(), c))
        })

        const totalCollections = new Array<Collection>()
        for (const [nftAddress, collection] of current) {

            let oldAverageSalePrice = BigNumber.from("0")
            let oldTotalVolume = BigNumber.from("0")
            let oldNumberOfSales = 0

            if (v1CollectionMap.has(nftAddress)) {

                const v1Collection = v1CollectionMap.get(nftAddress)
                if (!isNaN(v1Collection.averageSalePrice)) {
                    oldAverageSalePrice = utils.parseEther(v1Collection.averageSalePrice)
                }
                oldTotalVolume = utils.parseEther(v1Collection.totalVolume)
                oldNumberOfSales = Number(v1Collection.numberOfSales)

            }

            if (collection.floorPrice == null) {
                collection.floorPrice = utils.formatEther(BigNumber.from("0"))
            } else {
                collection.floorPrice = utils.formatEther(collection.floorPrice)
            }
            collection.totalVolume = oldTotalVolume.add(collection.totalVolume)
            collection.numberOfSales = oldNumberOfSales + collection.numberOfSales
            try {
                collection.averageSalePrice = utils.formatEther(collection.totalVolume.div(BigNumber.from(collection.numberOfSales)))
            } catch(error) {
                collection.averageSalePrice = utils.formatEther(BigNumber.from("0"))
            }
            collection.totalVolume = utils.formatEther(collection.totalVolume)
            collection.numberOfSales = collection.numberOfSales.toString()
            collection.numberActive = collection.numberActive.toString()
            collection.totalRoyalties = utils.formatEther(collection.totalRoyalties)
            collection.collection = nftAddress

            totalCollections.push(collection)
        }

        for (const [v1address, v1Collection] of v1CollectionMap) {

            if (current.has(v1address)) {
                const collection = current.get(v1address)

                let oldAverageSalePrice = BigNumber.from("0")
                if (!isNaN(v1Collection.averageSalePrice)) {
                    oldAverageSalePrice = utils.parseEther(v1Collection.averageSalePrice)
                }

                const newCollection = {
                    floorPrice: "0",
                    averageSalePrice: utils.formatEther(oldAverageSalePrice),
                    totalVolume: utils.formatEther(utils.parseEther(v1Collection.totalVolume)),
                    numberOfSales: v1Collection.numberOfSales,
                    numberActive: "0",
                    totalRoyalties: "0.0",
                    collection: v1address
                }
                totalCollections.push(newCollection)
            }
        }

        return totalCollections

    }


    static wtf = (listings: Listing[]) => {

        const collections = {}
        for (const item of listings) {
            let nftAddresses = [item.nftAddress]
            if(item.is1155){
                nftAddresses.push(item.nftAddress + "-" + item.nftId);            
            }
            for (const nftAddress of nftAddresses) {
                if (!collections.hasOwnProperty(nftAddress)) {
                    collections[nftAddress] = {
                        floorPrice: null,
                        averageSalePrice: BigNumber.from("0"),
                        totalVolume: BigNumber.from("0"),
                        totalRoyalties: BigNumber.from("0"),
                        numberOfSales: 0,
                        numberActive: 0
                    }
                    //console.log(nftAddress)
                }
                if (item.state === 0) {
                    if (collections[nftAddress].floorPrice == null) {
                        collections[nftAddress].floorPrice = utils.parseEther(item.price);
                    } else if (collections[nftAddress].floorPrice.gt(utils.parseEther(item.price))) {
                        collections[nftAddress].floorPrice = utils.parseEther(item.price);
                    }
                    collections[nftAddress].numberActive += 1
                } else if (item.state === 1) {
                    collections[nftAddress].totalVolume = collections[nftAddress].totalVolume.add(utils.parseEther(item.price));
                    collections[nftAddress].totalRoyalties = collections[nftAddress].totalRoyalties.add(utils.parseEther(item.royalty));
                    collections[nftAddress].numberOfSales += 1;
                }
            }
        }
        const old_collections = {}
        v1Collections.forEach((item) => {
            let nftAddresses = [item.collection]
            if(item.is1155){
                nftAddresses.push(item.collection + "-" + item.nftId);            
            }
            for (const nftAddress of nftAddresses) old_collections[nftAddress] = item
        });

        const totalCollections = new Array<Collection>()
        const keys = Object.keys(collections);
        keys.forEach((key) => {
            let oldAverageSalePrice = BigNumber.from("0");
            let oldTotalVolume = BigNumber.from("0");
            let oldNumberOfSales = 0;

            if (old_collections.hasOwnProperty(key)) {
                if (!isNaN(old_collections[key].averageSalePrice)) {
                    oldAverageSalePrice = utils.parseEther(old_collections[key].averageSalePrice);
                }
                oldTotalVolume = utils.parseEther(old_collections[key].totalVolume);
                oldNumberOfSales = Number(old_collections[key].numberOfSales);
            }

            if (collections[key].floorPrice == null) {
                collections[key].floorPrice = utils.formatEther(BigNumber.from("0"));
            } else {
                collections[key].floorPrice = utils.formatEther(collections[key].floorPrice);
            }
            collections[key].totalVolume = oldTotalVolume.add(collections[key].totalVolume);
            collections[key].numberOfSales = oldNumberOfSales + collections[key].numberOfSales;
            try {
                collections[key].averageSalePrice = utils.formatEther(collections[key].totalVolume.div(BigNumber.from(collections[key].numberOfSales)));
            } catch(error) {
                collections[key].averageSalePrice = utils.formatEther(BigNumber.from("0"));
            }
            collections[key].totalVolume = utils.formatEther(collections[key].totalVolume);
            collections[key].numberOfSales = collections[key].numberOfSales.toString();
            collections[key].numberActive = collections[key].numberActive.toString();
            collections[key].totalRoyalties = utils.formatEther(collections[key].totalRoyalties);
            // collections[key].totalFees = utils.formatEther(collections[key].totalFees);
            collections[key].collection = key;
            totalCollections.push(collections[key]);
        });
        const oldKeys = Object.keys(old_collections);
        oldKeys.forEach((key) => {
            if (!collections.hasOwnProperty(key)) {
                let oldAverageSalePrice = BigNumber.from("0");
                if (!isNaN(old_collections[key].averageSalePrice)) {
                    oldAverageSalePrice = utils.parseEther(old_collections[key].averageSalePrice);
                }
                const newCollection = {
                    floorPrice: "0",
                    averageSalePrice: utils.formatEther(oldAverageSalePrice),
                    totalVolume: utils.formatEther(utils.parseEther(old_collections[key].totalVolume)),
                    numberOfSales: old_collections[key].numberOfSales,
                    numberActive: "0",
                    totalRoyalties: "0.0",
                    // totalFees: "0.0",
                    collection: key
                }
                totalCollections.push(newCollection);
            }
        });

        return totalCollections
    }


}