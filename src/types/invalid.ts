export enum Invalid {
    False,
    Unknown,
    OwnerSeller,
    SellerBalance,
    Approvals,
    IsStaked
 }

export const False = Invalid[Invalid.False]
export const Unknown = Invalid[Invalid.Unknown]
export const Approvals = Invalid[Invalid.Approvals]
export const OwnerSeller = Invalid[Invalid.OwnerSeller]
export const SellerBalance = Invalid[Invalid.SellerBalance]
export const isStaked = Invalid[Invalid.IsStaked]
