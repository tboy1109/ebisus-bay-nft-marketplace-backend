import ngrok from 'ngrok'

export default abstract class Ngrok {

    static Connect = async () => {

        const url = await ngrok.connect({

            name: 'ebisusbay-http',
            configPath: './.ngrok.yml',

            onStatusChange: status => {
                console.log(status)
            },

            onLogEvent: data => {
                console.log(data)
            }

        })

        console.log(url)

    }

}
