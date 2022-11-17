import TaskStats from "../database/task/stats";
import { BigNumber, utils } from "ethers"
import Contracts from "../contract/contracts"
import NftTable from "../database/nft/table"
import NftRow from "../database/nft/row"
import ListingTable from "../database/listing/table";
import TokenRow from "../database/token/row";
import TokenTable from "../database/token/table";

export default abstract class CollectionUpdate {

    static Now = async (stats: TaskStats): Promise<TaskStats> => {

        try {
            
            const collections = await ListingTable.Collections()
            
            const nftPromises = collections.map( async (collection): Promise<NftRow> => {

                const nftContract = Contracts.Nft(collection.address, collection.is1155)
                let nftRow = new NftRow(collection.address.toLowerCase())

                if(!collection.is1155){
                    
                    try{ nftRow.owner = await nftContract.owner() } catch(error){stats.setError(error)}
                    try{ nftRow.name = await nftContract.name() } catch(error){stats.setError(error)}
                    try{ nftRow.symbol = await nftContract.symbol() } catch(error){stats.setError(error)}
                    try{ nftRow.total_supply = await nftContract.totalSupply()} catch(error){stats.setError(error)}
                    try{ nftRow.cost = utils.formatEther(await nftContract.cost()) } catch(error){stats.setError(error)}
                    try{ nftRow.max_supply = await nftContract.maxSupply() } catch(error){stats.setError(error)}
                    try{ nftRow.max_mint_amount = await nftContract.maxMintAmount() } catch(error){stats.setError(error)}
                    try{ nftRow.base_extension = await nftContract.baseExtension() } catch(error){stats.setError(error)}
                    try{ nftRow.not_revealed_uri = await nftContract.notRevealedUri() } catch(error){stats.setError(error)}
                    try{ nftRow.paused = await nftContract.paused() } catch(error){stats.setError(error)}
                    try{ nftRow.revealed = await nftContract.revealed() } catch(error){stats.setError(error)}

                    if(nftRow.owner){
                        nftRow.owner = nftRow.owner.toLowerCase()                        
                        try{ 
                            let walletOfOwner: BigNumber[]
                            walletOfOwner = await nftContract.walletOfOwner(nftRow.owner) 
                            if(walletOfOwner && walletOfOwner.length > 0){
                                let total = BigNumber.from("0")
                                for(const amount of walletOfOwner){
                                    total = total.add(amount)
                                }
                                nftRow.wallet_of_owner = utils.formatEther(total)
                            }
                        } catch(error){stats.setError(error)}
                    }

                }
                else{



                }

                return nftRow
                
            })

            const nftRows = await Promise.all(nftPromises)

            await NftTable.Replaces(nftRows)

            await NftTable.UpdateExt()

        } catch (error) {

            stats.setError(error)
            
        }
        return stats
        
    }
}