const Minio = require('minio');
const Q = require('q');
const logger = require('../aarnamLogger');
const fs = require('fs');
const path = require('path');

/**
 * Function to upload files to minio server.
 * @param {*} bucket
 * @param {*} filePath
 * @param {*} accessKey
 * @param {*} secretKey
 */
const putObject = (bucket, filePath, accessKey, secretKey) =>
    new Q.Promise((resolve, reject) => {
        // check if file exists
        if (!fs.existsSync(filePath)) {
            logger.error(`${filePath} does not exist!`);
            reject(new Error(`${filePath} does not exist!`));
        }

        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);

        const minioClient = new Minio.Client({
            endPoint: 'minio.aarnamsoftwares.com',
            useSSL: true,
            accessKey,
            secretKey,
        });

        fs.stat(filePath, function(err, stats) {
            if (err) {
                logger.error(`Error reading ${fileName} stats`, err);
                return reject(err);
            }

            minioClient.putObject(
                bucket,
                fileName,
                fileStream,
                stats.size,
                (err, etag) => {
                    if (err) {
                        logger.error(
                            `Error uploading ${fileName} to minio server`,
                            err
                        );
                        reject(err);
                    }

                    if (etag) {
                        logger.success(`Successfully uploaded ${filePath}`);
                        resolve(etag);
                    }
                }
            );
        });
    });

/**
 * Function to create bucket if not present
 * @param {*} bucket
 * @param {*} accessKey
 * @param {*} secretKey
 */
const createBucket = (bucket, accessKey, secretKey) =>
    new Q.Promise((resolve, reject) => {
        const minioClient = new Minio.Client({
            endPoint: 'minio.aarnamsoftwares.com',
            useSSL: true,
            accessKey,
            secretKey,
        });

        // check if bucket exists or not.
        minioClient.bucketExists(bucket, (err, exists) => {
            if (err) {
                logger.error('Error checking bucket status', err);
                reject();
            }

            if (!exists) {
                minioClient.makeBucket(bucket, err => {
                    if (err) {
                        logger.error('Error creating bucket!', err);
                        reject();
                    } else {
                        logger.info(`Created new bucket ${bucket}`);
                        resolve(true);
                    }
                });
            } else {
                logger.warn(
                    `Bucket ${bucket} exists. Files will be overwritten`
                );
                resolve(true);
            }
        });
    });

module.exports = {
    createBucket,
    putObject,
};
