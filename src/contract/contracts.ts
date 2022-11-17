import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'

const FiveMinutes = 300000

export default abstract class Contracts {

    static ProviderConfig5m = { url: process.env.PROVIDER_URL, timeout: FiveMinutes }

    static Provider5m = new ethers.providers.JsonRpcProvider(this.ProviderConfig5m)

    static AuctionAddress = process.env.AUCTIONS_ADDRESS

    static AuctionAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi/auctions.json')).toString())

    static Auction = new ethers.Contract(this.AuctionAddress, this.AuctionAbi, this.Provider5m)

    static MarketplaceAddress = process.env.CONTRACT_ADDRESS

    static MarketeplaceAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi/marketplace.json')).toString())

    static Marketplace = new ethers.Contract(this.MarketplaceAddress, this.MarketeplaceAbi, this.Provider5m)

    static NftAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi/nft.json')).toString())

    static NftAbi1155 = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi/erc1155.json')).toString())

    static Nft = (nftAddress: string, is1155: boolean): ethers.Contract => {
       
        if(is1155){
            return new ethers.Contract(nftAddress, this.NftAbi1155, this.Provider5m)
        } else {
            return new ethers.Contract(nftAddress, this.NftAbi, this.Provider5m)
        }
        
    }





}