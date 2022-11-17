import mysql from 'mysql'

export default class DatabaseTable {
    
    static config: mysql.PoolConfig = {

        host: process.env.AWS_MYSQL_HOST,
        user: process.env.AWS_MYSQL_USER,
        password: process.env.AWS_MYSQL_PASSWORD,
        database: process.env.AWS_MYSQL_DATABASE,
        queueLimit: +(process.env.AWS_MYSQL_QUEUE_LIMIT || "10"),
        connectionLimit: +(process.env.AWS_MYSQL_CONN_LIMIT || "1000"),
    }

    static pool = mysql.createPool(this.config)

}