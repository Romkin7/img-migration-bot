import { config } from 'dotenv';
import http from 'http';
import connectToMongoDB from './config/db.config';
import { getType } from 'mime';
import categories from './utils/categories';
import Product from './models/product.model';
import configureAWSS3 from './config/aws.config';
import Order from './models/order.model';
import User from './models/user.model';
import DeliveryCost from './models/deliveryCost.model';
import IProduct from './types/product.model';
import stream from 'stream';

async function updateProducts() {
    try {
        config();
        await connectToMongoDB();
        const s3 = configureAWSS3();
        const products = await Product.find({
            fullname: 'Testitarvike ',
            migrated: false,
            category: {
                $in: categories,
            },
        })
            .sort({ createdAt: -1 })
            .limit(100);
        console.log('Products amount is: ');
        console.log(products.length);
        products.map(async (product: IProduct) => {
            const fileURL = product.cover.replace('https://', 'http://');
            http.get(fileURL, async (response) => {
                const writeStream = new stream.PassThrough();
                const alt = `${product.fullname}-${product.category}-${product.type}`;
                const mimetype = getType(product.cover);
                console.log(`mimetype is ${mimetype} and alt is ${alt}`);
                const result = await s3
                    .upload({
                        Bucket: `${process.env.AWS_S3_BUCKET_NAME}/tuotteet`,
                        ACL: 'public-read',
                        Key: alt,
                        ContentType: mimetype,
                        Body: response.pipe(writeStream),
                    })
                    .promise();
                product.cover = result.Location;
                product.alt = alt;
                console.log(product.alt, product.cover);
            });
        });
    } catch (error) {
        console.dir(error);
    }
}

//const updater = setInterval(updateProducts, 1000);
updateProducts();
