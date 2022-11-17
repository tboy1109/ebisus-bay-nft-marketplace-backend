
export default class NftExtRow {

    address: string
    name_ext: string
    multi_token: boolean
    on_chain: boolean
    listable: boolean

    // metadata
    verified: boolean
    max_supply: number
    slug: string
    description: string
    avatar: string
    card: string
    banner: string
    website: string
    discord: string
    gitbook: string
    medium: string
    telegram: string
    twitter: string

    constructor(address: string){
        this.address = address
    }

    populate(result: any) {

        this.name_ext = result.name
        this.multi_token = result.multi_token
        this.on_chain = result.on_chain
        this.listable = result.listable

        this.verified = result.verified
        this.max_supply = result.max_supply
        this.slug = result.slug
        this.description = result.description
        this.avatar = result.avatar
        this.card = result.card
        this.banner = result.banner
        this.website = result.website
        this.discord = result.discord
        this.gitbook = result.gitbook
        this.medium = result.medium
        this.telegram = result.telegram
        this.twitter = result.twitter

        return this
    }

}