import cloudinary from 'cloudinary';

/**
 * configureCloudinary function
 * @returns {typeof cloudinary}
 */
function configureCloudinary(): typeof cloudinary {
    /* Configure Cloudinary */
    cloudinary.v2.config({
        cloud_name: process.env.CLOUDNAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    return cloudinary;
}

export default configureCloudinary;
