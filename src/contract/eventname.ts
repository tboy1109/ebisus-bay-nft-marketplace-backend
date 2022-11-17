export enum EventName {
    Transfer,
    TransferBatch,
    TransferSingle
 }

export const Transfer = EventName[EventName.Transfer]
export const TransferBatch = EventName[EventName.TransferBatch]
export const TransferSingle = EventName[EventName.TransferSingle]