import Contracts from '../contract/contracts'

export default abstract class AuctionListen {

    static Listen = async () => {

        Contracts.Auction.on('CreateAuction', async (auctionHash) => {
            console.log('CreateAuction')
        })

        Contracts.Auction.on('Start', async (auctionHash, sender, amount) => {
            console.log('Start')
        })

        Contracts.Auction.on('Bid', async (auctionHash, sender, amount) => {
            console.log('Bid')
        })

        Contracts.Auction.on('Accept', async (auctionHash, sender, amount) => {
            console.log('Accept')
        })

        Contracts.Auction.on('TimeIncreased', async (auctionHash, sender, amount) => {
            console.log('TimeIncreased')
        })

        Contracts.Auction.on('Withdraw', async (auctionHash, sender, amount) => {
            console.log('Withdraw')
        })

        Contracts.Auction.on('Cancel', async (auctionHash, sender, amount) => {
            console.log('Cancel')
        })

    }

}



