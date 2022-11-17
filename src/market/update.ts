import Database from "../database/database"

import Listing from "../types/listing"
import { State } from "../types/state"
import Address from '../utils/address'
import Contracts from "../contract/contracts"
import { Invalid } from "../types/invalid"
import { ResultStats } from "../types/resultstats"
import Clisting from "../types/clisting"
import TaskStats from "../database/task/stats"
import AWS from "aws-sdk"
import axios from "axios"
import Nft from "../types/nft"

const PageSize = 500

export default abstract class MarketUpdate {

    static Now = async (stats: TaskStats): Promise<TaskStats> => {

        try {

            await MarketUpdate.Active()

            await MarketUpdate.Complete()

            await MarketUpdate.Cancelled()

        } catch (error) {
            stats.setError(error)
        }
        return stats

    }

    static GetContractListing = async (listingId: number): Promise<Clisting> => {
        for (let s in State) {
            if (!isNaN(Number(s))) {
                const state = Number(s)
                return await this.GetContractListingState(listingId, state)
            }
        }
        return undefined
    }

    static GetContractListingState = async (listingId: number, state: State): Promise<Clisting> => {
        let clisting = undefined
        if (State.Active === state) {
            return new Clisting(await Contracts.Marketplace.activeListing(listingId), state)
        }
        else if (State.Complete === state) {
            return new Clisting(await Contracts.Marketplace.completeListing(listingId), state)
        }
        else if (State.Cancelled === state) {
            return new Clisting(await Contracts.Marketplace.cancelledListing(listingId), state)
        }
        return undefined
    }

    static UpdateListings = async (state: State, listings: Listing[], invalidate: boolean): Promise<ResultStats> => {

        let stats = new ResultStats(state)
        const updatePromises = listings.map(async (listing: Listing): Promise<Listing> => {
            try {
                let clisting = await this.GetContractListingState(listing.listingId, state)
                if (clisting) {
                    let updatedListing = await this.FromContractListing(clisting)
                    if (State.Active === state && invalidate) {
                        updatedListing = await this.Invalidate(updatedListing)
                    } else {
                        updatedListing.setInvalid(listing.invalid)
                    }
                    return updatedListing
                }
            } catch (error) {
                console.log(error.message)
                stats.errors++
            }
        })
        let updateListings = await Promise.all(updatePromises)
        stats.updates = await Database.SyncListings(updateListings)
        stats.total = listings.length
        return stats

    }

    static Active = async (): Promise<ResultStats> => {

        let stats = new ResultStats(State.Active)
        try {

            const blockCount = (await Contracts.Marketplace.totalActive()).toNumber()

            const pagelist = Array.from(Array(Math.ceil(blockCount / PageSize)).keys())

            //const lastpagelist = pagelist.splice(pagelist.length - 15, pagelist.length - 1)

            const contractListingPromises = pagelist.map((page: number) => Contracts.Marketplace.pagedActive(page + 1, PageSize))

            let contractListings = (await Promise.all(contractListingPromises)).flat()

            contractListings = contractListings.map((c: any) => new Clisting(c, State.Active))

            const listingPromises = contractListings.map((clisting: Clisting) => this.FromContractListing(clisting))

            let listings = await Promise.all(listingPromises)

            const invalidatePromises = listings.map( (listing) => this.Invalidate(listing))

            let invalidated = await Promise.all(invalidatePromises)

            stats.updates = await Database.SyncListings(invalidated)

            stats.total = await Database.AdminStateCount(State.Active)

            stats.valid = await Database.AdminStateValidCount(State.Active)

        } catch (error) {
            console.log(error.message)
            stats.errors++
        }

        return stats.stop()

    }

    static Complete = async (): Promise<ResultStats> => {

        let stats = new ResultStats(State.Complete)
        try {

            const blockCount = (await Contracts.Marketplace.totalComplete()).toNumber()

            const pagelist = Array.from(Array(Math.ceil(blockCount / PageSize)).keys())

            const contractListingPromises = pagelist.map((page: number) => Contracts.Marketplace.pagedComplete(page + 1, PageSize))

            let contractListings = (await Promise.all(contractListingPromises)).flat()

            contractListings = contractListings.map((c: any) => new Clisting(c, State.Complete))

            const listingPromises = contractListings.map((clisting: Clisting) => this.FromContractListing(clisting))

            let listings = await Promise.all(listingPromises)

            stats.updates = await Database.SyncListings(listings)

            stats.total = await Database.AdminStateCount(State.Complete)

            stats.valid = await Database.AdminStateValidCount(State.Complete)

        } catch (error) {
            console.log(error.message)
            stats.errors++
        }

        return stats.stop()

    }

    static Cancelled = async (): Promise<ResultStats> => {

        let stats = new ResultStats(State.Cancelled)
        try {

            const blockCount = (await Contracts.Marketplace.totalCancelled()).toNumber()

            const pagelist = Array.from(Array(Math.ceil(blockCount / PageSize)).keys())

            const contractListingPromises = pagelist.map((page: number) => Contracts.Marketplace.pagedCancelled(page + 1, PageSize))

            let contractListings = (await Promise.all(contractListingPromises)).flat()

            contractListings = contractListings.map((c: any) => new Clisting(c, State.Cancelled))

            const listingPromises = contractListings.map((clisting: Clisting) => this.FromContractListing(clisting))

            let listings = await Promise.all(listingPromises)

            stats.updates = await Database.SyncListings(listings)

            stats.total = await Database.AdminStateCount(State.Cancelled)

            stats.valid = await Database.AdminStateValidCount(State.Cancelled)

        } catch (error) {
            console.log(error.message)
            stats.errors++
        }

        return stats.stop()

    }

    static Collection = async (state: State, collection: string, invalidate: boolean): Promise<ResultStats> => {

        let stats = undefined
        stats = (stats === undefined && State.Active === state) ? await this.ActiveCollection(collection, invalidate) : stats
        stats = (stats === undefined && State.Complete === state) ? await this.CompleteCollection(collection) : stats
        stats = (stats === undefined && State.Cancelled === state) ? await this.CancelledCollection(collection) : stats
        return stats

    }

    static ActiveCollection = async (collection: string, invalidate: boolean = false): Promise<ResultStats> => {

        let stats = new ResultStats(State.Active)
        try {

            const blockCount = (await Contracts.Marketplace.totalActive()).toNumber()

            const pagelist = Array.from(Array(Math.ceil(blockCount / PageSize)).keys())

            const contractListingPromises = pagelist.map((page: number) => Contracts.Marketplace.pagedActive(page + 1, PageSize))

            let contractListings = (await Promise.all(contractListingPromises)).flat()

            contractListings = contractListings.map((c: any) => new Clisting(c, State.Active))

            if (collection) {
                contractListings = contractListings.filter((clisting: Clisting) => clisting.getNftAddress().toLowerCase() === collection.toLowerCase())
            }

            if (contractListings.length > 0) {

                const listingPromises = contractListings.map((clisting: Clisting) => this.FromContractListing(clisting))

                let listings = await Promise.all(listingPromises)

                if (invalidate) {
                    const invalidatePromises = listings.map((listing) => this.Invalidate(listing))
                    listings = await Promise.all(invalidatePromises)
                }

                stats.updates = await Database.SyncListings(listings)

                stats.total = await Database.AdminStateCollectionCount(State.Active, collection)

                stats.valid = await Database.AdminStateValidCollectionCount(State.Active, collection)

            }

        } catch (error) {
            stats.errors++
        }

        return stats.stop()

    }

    static CompleteCollection = async (collection: string): Promise<ResultStats> => {

        let stats = new ResultStats(State.Complete)
        try {

            const blockCount = (await Contracts.Marketplace.totalComplete()).toNumber()

            const pagelist = Array.from(Array(Math.ceil(blockCount / PageSize)).keys())

            const contractListingPromises = pagelist.map((page: number) => Contracts.Marketplace.pagedComplete(page + 1, PageSize))

            let contractListings = (await Promise.all(contractListingPromises)).flat()

            contractListings = contractListings.map((c: any) => new Clisting(c, State.Complete))

            if (collection) {
                contractListings = contractListings.filter((clisting: Clisting) => clisting.getNftAddress().toLowerCase() === collection.toLowerCase())
            }

            if (contractListings.length > 0) {

                const listingPromises = contractListings.map((clisting: Clisting) => this.FromContractListing(clisting))

                let listings = await Promise.all(listingPromises)

                stats.updates = await Database.SyncListings(listings)

                stats.total = await Database.AdminStateCollectionCount(State.Complete, collection)

                stats.valid = await Database.AdminStateValidCollectionCount(State.Complete, collection)

            }

        } catch (error) {
            stats.errors++
        }

        return stats.stop()
    }

    static CancelledCollection = async (collection: string): Promise<ResultStats> => {

        let stats = new ResultStats(State.Cancelled)
        try {

            const blockCount = (await Contracts.Marketplace.totalCancelled()).toNumber()

            const pagelist = Array.from(Array(Math.ceil(blockCount / PageSize)).keys())

            const contractListingPromises = pagelist.map((page: number) => Contracts.Marketplace.pagedCancelled(page + 1, PageSize))

            let contractListings = (await Promise.all(contractListingPromises)).flat()

            contractListings = contractListings.map((c: any) => new Clisting(c, State.Cancelled))

            if (collection) {
                contractListings = contractListings.filter((clisting: Clisting) => clisting.getNftAddress().toLowerCase() === collection.toLowerCase())
            }

            if (contractListings.length > 0) {

                const listingPromises = contractListings.map((clisting: Clisting) => this.FromContractListing(clisting))

                let listings = await Promise.all(listingPromises)

                stats.updates = await Database.SyncListings(listings)

                stats.total = await Database.AdminStateCollectionCount(State.Cancelled, collection)

                stats.valid = await Database.AdminStateValidCollectionCount(State.Cancelled, collection)

            }

        } catch (error) {
            stats.errors++
        }

        return stats.stop()
    }

    static FromContractListing = async (clisting: Clisting): Promise<Listing> => {

        try {
            
            if (clisting.isValid()) {

                const listing = new Listing(clisting.getListingId()).populateEvent(clisting)
                let nft = await this.FromBucket(process.env.AWS_S3_BUCKET, listing.getBucketKey())
                if (nft === undefined) {
                    nft = await this.FromContract(listing.nftAddress, listing.nftId, listing.is1155)
                }
                listing.nft = nft
                
                // TODO: Figure this out later and remove
                if(!listing.nft && listing.nftAddress === Address.WEB_678){
                    listing.nft = await listing.activateWeb678()
                }

                return listing
            }

        } catch (error) {
            console.log("FromContractListing", error.message)
        }
        return undefined

    }

    static Invalidate = async (listing: Listing): Promise<Listing> => {
        if (listing === undefined) return undefined

        try {
            const nftContract = Contracts.Nft(listing.nftAddress, listing.is1155)
            if (listing.nftAddress.toLowerCase() == "0x0b289dEa4DCb07b8932436C2BA78bA09Fbd34C44".toLowerCase()) {
                const isStaked = await nftContract.stakedApes(listing.nftId);
                if (isStaked) {
                    listing.setInvalid(Invalid.IsStaked)
                    return listing;
                }
            }
            if (listing.is1155) {
                const balance = await nftContract.balanceOf(listing.seller, listing.nftId)
                if (balance < 1) {
                    listing.setInvalid(Invalid.SellerBalance)
                    return listing
                }
                const isApprovedForAll = await nftContract.isApprovedForAll(listing.seller, Contracts.MarketplaceAddress)
                if (!isApprovedForAll) {
                    listing.setInvalid(Invalid.Approvals)
                    return listing
                }
            } else {
                const currentOwner = await nftContract.ownerOf(listing.nftId)
                if (currentOwner.toLowerCase() != listing.seller.toLowerCase()) {
                    listing.setInvalid(Invalid.OwnerSeller)
                    return listing
                }
                const isApprovedForAll = await nftContract.isApprovedForAll(listing.seller, Contracts.MarketplaceAddress)
                if (!isApprovedForAll) {
                    listing.setInvalid(Invalid.Approvals)
                    return listing
                }
            }
            listing.setInvalid(Invalid.False)
            return listing

        } catch (error) {
            listing.setInvalid(Invalid.Unknown)
            return listing
        }

    }


    static FromAnywhere = async (nftAddress: string, nftId: number): Promise<Nft> => {

        let nft: Nft
        if (nft === undefined) {
            const key = 'files/' + nftAddress.toLowerCase() + "/metadata/" + nftId + ".json"
            nft = await this.FromBucket(process.env.AWS_S3_BUCKET, key)
        }
        if (nft === undefined) {
            nft = await this.FromContract(nftAddress, nftId, false)
        }
        if (nft === undefined) {
            nft = await this.FromContract(nftAddress, nftId, true)
        }
        return nft

    }

    static FromBucket = async (bucket: string, key: string): Promise<Nft> => {

        try {

            const meta = await s3Client.getObject({ Bucket: bucket, Key: key }).promise()
            const json = JSON.parse(meta.Body.toString('utf-8'))

            let nft: Nft = new Nft(parseNftAddress(key), json.edition)
            nft = Object.assign(nft, json)

            if (nft.attributes !== undefined) {
                const simplifiedAttributes = {}
                for (const attribute of nft.attributes) {
                    if (attribute.trait_type !== undefined) {
                        simplifiedAttributes[attribute.trait_type] = attribute.value
                    }
                }
                nft.simplifiedAttributes = simplifiedAttributes
            }
            return nft

        } catch (err) {
            return undefined
        }

    }

    static FromContract = async (nftAddress: string, nftId: number, is1155: boolean): Promise<Nft> => {

        try {

            const nftContract = Contracts.Nft(nftAddress, is1155)
            let uri = is1155 ? await nftContract.uri(nftId) : await nftContract.tokenURI(nftId)
            uri = getValidUrl(uri, ipfsHostEbisusBay, false)
            let data = uri
            if (typeof uri !== "object") {
                httpClient.defaults.timeout = 30000
                data = (await httpClient.get(uri)).data
            }
            return this.Model(nftAddress, nftId, data)

        } catch (err) {
            return undefined
        }

    }

    static Model = (nftAddress: string, nftId: number, json: object): Nft => {

        let nft = new Nft(nftAddress, nftId)
        nft = Object.assign(nft, json)
        if (nft.image !== undefined) {
            nft.image = getValidUrl(nft.image, ipfsHostEbisusBay, true)
        }
        if (nft.original_image !== undefined) {
            nft.original_image = getValidUrl(nft.original_image, ipfsHostPinataCloud, true)
        }
        if (nft.properties !== undefined) {
            nft.attributes = nft.properties
            nft.properties = undefined
        }
        if (nft.attributes !== undefined && nft.attributes.length > 0) {
            const simplifiedAttributes = {}
            for (const attribute of nft.attributes) {
                simplifiedAttributes[attribute.trait_type] = attribute.value
            }
            nft.simplifiedAttributes = simplifiedAttributes
        }
        return nft

    }

}

const s3Client = new AWS.S3()
const httpClient = axios.create()

const ipfsHostEbisusBay = process.env.IPFS_HOST_EBISUSBAY
const ipfsHostPinataCloud = process.env.IPFS_HOST_PINATA

AWS.config.update({ region: process.env.AWS_S3_REGION })

const parseNftAddress = (key: string) => {

    const startIdx = key.indexOf("files/") + 6
    const endIdx = key.indexOf("/", startIdx)
    return key.substring(startIdx, endIdx)

}

const getValidUrl = (uri: string, host: string, image = false) => {

    const hash = uri.split("://")[1]

    if (uri.startsWith("ipfs://")) {

        return host + hash

    } else if (uri.startsWith("ar://")) {

        return "https://arweave.net/" + hash

    } else if (uri.startsWith("https://")) {

        if (uri.includes("gateway.pinata.cloud") || uri.includes("ipfs.io")) {
            return host + uri.split("/ipfs/")[1]
        }
        return uri

    }
    else if (uri.startsWith("http://")) {

        return uri.replace("http://", "https://")

    }

    if (image) return uri

    uri = uri.split("base64,")[1]
    let jsonObject = JSON.parse(Buffer.from(uri, 'base64').toString())
    return jsonObject

}