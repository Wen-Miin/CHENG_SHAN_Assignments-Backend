import { config } from 'dotenv'
import app from 'app'
import mongoose from 'mongoose'

// Loads .env file contents into process.env.
config({ path: '.env.production' })

// Assign process.env environment variables to constants
const DB_PORT = process.env['DB_PORT']
const DB_NAME = process.env['DB_NAME']
const API_PORT = process.env['API_PORT']
const DB_USERNAME = process.env['DB_USERNAME']
const DB_PASSWORD = process.env['DB_PASSWORD']
const ENVIRONMENT = process.env['ENVIRONMENT']
const MONGO_HOST = process.env['MONGO_HOST']

// Start mongo connection
mongoose
    .connect(
        `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${MONGO_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`,
        {
            serverSelectionTimeoutMS: 10000,
        }
    )
    .then((r) => {
        const mongo = r.connection
        mongo.on('error', console.error.bind(console, 'connection error:'))
        console.log(`MONGO: connected to "${DB_NAME}" mongodb database!`)
    })

// Start the web server on the defined port and defined environment
app.listen(API_PORT, () => {
    console.log(`Server is running on port ${API_PORT}.`)
    console.log(`Environment: ${ENVIRONMENT}.`)
})
