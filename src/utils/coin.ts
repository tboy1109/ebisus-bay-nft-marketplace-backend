
export default class Coin {

    static formatCrypto(amount: string, digits = 4): string {

        const formatter = new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        })

        const formatted = formatter.format(+amount)
        return formatted.replace(/\,/g,'')

    }

    static formatFiat(amount: string, digits = 2): string {

        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        })

        return formatter.format(+amount)

    }

}