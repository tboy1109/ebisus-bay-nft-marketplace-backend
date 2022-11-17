import { ChannelWrapper } from "amqp-connection-manager"
import { IAmqpConnectionManager } from "amqp-connection-manager/dist/esm/AmqpConnectionManager"
import { ConfirmChannel, Options } from "amqplib"
import Listing from "../types/listing"
import Manager from "./manager"

// AWS_AMQP_ENDPOINT=amqps://ebisusbay:marketplace@b-6d54927a-cbb9-4aa4-a015-370ad5aa5fbd.mq.us-east-1.amazonaws.com:5671/ebisusbay

export default abstract class Exchange extends Manager {

    static exchangeName: string
    static channelWrapper: ChannelWrapper
    static amqpClient: IAmqpConnectionManager

    static Publisher = async (exchangeName: string) => {
        this.exchangeName = exchangeName

        this.amqpClient = this.connect()

        this.channelWrapper = this.amqpClient.createChannel({
            json: true,
            setup: async (channel: ConfirmChannel) => {
                await channel.assertExchange(exchangeName, 'fanout', { durable: true } )
            }
        })

        this.channelWrapper.waitForConnect().then( () => {
            // console.log("Ready to Publish", this.exchangeName);
        })

    }

    static Subscriber = async (exchangeName: string, queueName: string) => {
        this.exchangeName = exchangeName

        this.amqpClient = this.connect()

        this.channelWrapper = this.amqpClient.createChannel({ json: true,
            setup: async (channel: ConfirmChannel) => {
                await channel.assertExchange(exchangeName, 'fanout', { durable: true } )
                const { queue } = await channel.assertQueue(queueName, {exclusive: false, autoDelete: false, durable: true } )
                channel.bindQueue(queue, exchangeName, '')
                await channel.consume(queue, this.ReceiveListing, { noAck: false } )
            }
        })

        this.channelWrapper.waitForConnect().then( () => {
            // console.log("Ready to Receive", this.exchangeName);
        })

    }

    static PublishListing = async (listing: Listing) => {

        console.log(listing.toJsonSummary())

        this.channelWrapper
            .publish(this.exchangeName, "", listing).then(() => {

            })
            .catch(err => {
                console.log("Message was rejected:", err.stack)
                this.channelWrapper.close()
                this.amqpClient.close()
            })

    }

    static ReceiveListing = (data: any) => {

       const json = JSON.parse(data.content)

        const listing = Object.assign(new Listing(json.listingId), json)
        console.log(listing.toJsonSummary())

        this.channelWrapper.ack(data)

    }

}

// Exchange.Subscriber("marketplace","listings-" + port)

