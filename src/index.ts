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
import stream from 'stream';
import configureCloudinary from './config/cloudinary.config';

async function updateProducts() {
    try {
        config();
        await connectToMongoDB();

        const s3 = configureAWSS3();
        const cloudinary = configureCloudinary();

        async function traverse(products: any) {
            products.map(async (product: any, index: number) => {
                if (!product.cover_id || (!!product.alt && !product.migrated)) {
                    product.migrated = true;
                    product.format = product.type;
                    await product.save();
                    console.log(
                        `Product ${product.fullname} was already migrated`,
                    );
                    if (index === products.length - 1) {
                        const productsArr = await Product.find({
                            migrated: false,
                            category: {
                                $in: categories,
                            },
                        })
                            .sort({ createdAt: -1 })
                            .limit(1);
                        if (productsArr.length) {
                            traverse(productsArr);
                        } else {
                            return;
                        }
                    }
                } else {
                    const fileURL = product.cover.replace(
                        'https://',
                        'http://',
                    );
                    http.get(fileURL, async (response) => {
                        const writeStream = new stream.PassThrough();
                        const alt = `${product.fullname}-${product.category}-${product.type}`;
                        const mimetype = getType(product.cover);
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
                        cloudinary.v2.uploader.destroy(
                            product.cover_id,
                            async (error: any) => {
                                if (error) {
                                    console.dir(error);
                                } else {
                                    console.log(product.alt, product.cover);
                                    product.cover_id = null;
                                    product.migrated = true;
                                    product.format = product.type || 'unknown';
                                    await product.save();
                                    if (index === products.length - 1) {
                                        const productsArr = await Product.find({
                                            migrated: false,
                                            category: {
                                                $in: categories,
                                            },
                                        })
                                            .sort({ createdAt: -1 })
                                            .limit(1);
                                        if (productsArr.length) {
                                            traverse(productsArr);
                                        } else {
                                            return;
                                        }
                                    }
                                }
                            },
                        );
                    });
                }
            });
        }

        const products = await Product.find({
            migrated: false,
            category: {
                $in: categories,
            },
        })
            .sort({ createdAt: -1 })
            .limit(1);
        traverse(products);
    } catch (error) {
        console.dir(error);
    }
}

updateProducts();
