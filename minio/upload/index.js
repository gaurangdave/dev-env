const argv = require('yargs').argv;
const fileWalker = require('../../utils/walker').fileWalker;
const minio = require('../../utils/minio');
const logger = require('../../utils/aarnamLogger');

/**
 * Required Inputs
 * bucket : bucket name to upload to.
 * source : source directory to upload from.
 * accessKey : access key for minio.
 * secretKey : secret key for minio.
 */
const isInputValid = () =>
    argv.bucket && argv.source && argv.accessKey && argv.secretKey;

const run = async () => {
    if (!isInputValid()) {
        logger.error('Invalid or missing arguments');
        process.exit(1);
    }

    const { bucket, source, accessKey, secretKey } = argv;
    /**
     * 1. Check minio access using accessKey and secretKey.
     * 2. Check if source directory exists.
     * 3. Walk through the directory to upload files.
     */

    /**
     * TODO
     * 1.
     * 2. Use utils/walker to walk through the source directory and start uploading files to the bucket.
     * 3. Create a counter to keep track of number of files uploaded.
     * 4. On success full upload print the success message with the count.
     */

    try {
        // Check if the bucket exists if not create one
        await minio.createBucket(bucket, accessKey, secretKey);
        let fileUploadCount = 0;
        fileWalker(source).subscribe(
            async filePath => {
                fileUploadCount++;
                await minio.putObject(bucket, filePath, accessKey, secretKey);
            },
            error => {},
            () => {
                logger.info(`Attempting to upload ${fileUploadCount} files`);
            }
        );
    } catch (error) {
        logger.error(error);
    }
};

run();
