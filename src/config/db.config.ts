import mongoose from 'mongoose';

/**
 * connectMongoDB function
 * @returns {Promise<typeof mongoose>}
 */
async function connectToMongoDB(): Promise<typeof mongoose> {
    try {
        const dbUrl =
            process.env.NODE_ENV === 'production'
                ? process.env.PROD_DATABASE
                : process.env.DATABASE;

        const connection = await mongoose.connect(dbUrl, {
            keepAlive: true,
        });

        console.log(`Connected to DB ${dbUrl}`);
        return connection;
    } catch (error) {
        throw new Error(error);
    }
}

export default connectToMongoDB;
