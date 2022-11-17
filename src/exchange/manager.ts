import amqp from "amqp-connection-manager"
import { IAmqpConnectionManager } from "amqp-connection-manager/dist/esm/AmqpConnectionManager"

export default abstract class Maanger {

    static connect = (): IAmqpConnectionManager => {

        const amqpClient = amqp.connect([process.env.AWS_AMQP_ENDPOINT])

        amqpClient.on('connect', (data) => {
            // console.log('connected')
        })

        amqpClient.on('connectFailed', (data) => {
            console.log('connectFailed', data)
        })

        amqpClient.on('disconnect', (data) => {
            console.log('disconnect', data)
        })

        amqpClient.on('blocked', (data) => {
            console.log('blocked', data)
        })

        amqpClient.on('unblocked', () => {
            console.log('unblocked')
        })

        return amqpClient
    }

}