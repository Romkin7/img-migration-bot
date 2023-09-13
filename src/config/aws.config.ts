import AWS, { S3 } from 'aws-sdk';

/**
 * configureAWSS3 function
 * @returns {S3}
 */
function configureAWSS3(): S3 {
    return new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    });
}

export default configureAWSS3;
