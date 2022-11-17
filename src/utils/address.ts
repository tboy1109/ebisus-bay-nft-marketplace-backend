


export default abstract class Address {

    static Genesis = '0x0000000000000000000000000000000000000000'

    // https://ebisusbay.atlassian.net/browse/WEB-678
    static WEB_678 = '0x19E1F891002240fBEA77ccC2aDb6e73b93B3b97A'


    static valid = (address: string): boolean => {

        return this.Genesis === address ? false : true

    }

}