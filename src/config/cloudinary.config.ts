import cloudinary, { ConfigOptions } from 'cloudinary';

/**
 * configureCloudinary function
 * @returns {ConfigOptions}
 */
function configureCloudinary(): ConfigOptions {
    /* Configure Cloudinary */
    return cloudinary.v2.config({
        cloud_name: process.env.CLOUDNAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
}

export default configureCloudinary;
