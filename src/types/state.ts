export enum State {
    Active,
    Complete,
    Cancelled
 }

export const Active = State[State.Active]
export const Complete = State[State.Complete]
export const Cancelled = State[State.Cancelled]