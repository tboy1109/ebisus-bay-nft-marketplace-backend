import { BigNumber, Contract } from "ethers"

import Contracts from "../contract/contracts"
import TaskStats from "../database/task/stats"
import EventTable from "../database/event/table"
import ListingTable from "../database/listing/table"
import { TransferRow } from "../database/event/transfer"
import { TransferBatchRow } from "../database/event/transfer-batch"
import { TransferSingleRow } from "../database/event/transfer-single"
import { Transfer, TransferBatch, TransferSingle } from "../contract/eventname"

export default abstract class CollectionListen {

    static Transfers = new Map<string, Contract>()
    
    // 1. create/store token transfer listeners for all our site collections
    static Now = async (stats: TaskStats): Promise<TaskStats> => {
        const collections = await ListingTable.Collections()
        for(const collection of collections){
            try{
                if(!this.Transfers.has(collection.address)){
                    const tokentransfer = this.Transfer(stats, collection.address, collection.is1155)
                    this.Transfers.set(collection.address, tokentransfer)
                }   
            } catch(error){stats.setError(error)}
        }   
        return stats
    }

    // 2. store the emitted data in a table named after the event that fired
    static Transfer = (stats: TaskStats, collection: string, is1155: boolean): Contract => { 
        const contract = Contracts.Nft(collection, is1155)
        if(!is1155){
            contract.on(Transfer, async (from: string, to: string, token: BigNumber) => {
                try{
                    const data = new TransferRow(collection, from, to, token.toNumber())
                    const success = await EventTable.Replace(data)
                } catch (error) { stats.setError(error) }
            })
        } else {
            contract.on(TransferSingle, async (operator: string, from: string, to: string, id: BigNumber, value: BigNumber) => {
                try{
                    const data = new TransferSingleRow(collection, operator, from, to, id.toNumber(), value.toNumber())
                    const success = await EventTable.Replace(data)
                } catch (error) { stats.setError(error) }
            })
            contract.on(TransferBatch, async (operator: string, from: string, to: string, ids: BigNumber[], values: BigNumber[]) => {
                ids.map( async (id: BigNumber, idx: number) => {
                    try{
                        const data = new TransferBatchRow(collection, operator, from, to, id.toNumber(), values[idx].toNumber())
                        const success = await EventTable.Replace(data)
                    } catch (error) { stats.setError(error) }
                })
            })
        }
        return contract
    }

}