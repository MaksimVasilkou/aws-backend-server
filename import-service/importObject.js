import AWS from 'aws-sdk';
import csvParser from 'csv-parser';

export const createSignedLink = async (event, context, callback) => {
  try {
    console.log(
      `execution func createSignedLink, Event = ${JSON.stringify(
        event
      )}, context = ${JSON.stringify(context)}, callback = ${callback}`
    );
    const s3 = new AWS.S3();
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
    const {
      queryStringParameters: { name },
    } = event;
    const BUCKET_NAME = 'import-cars-bucket';
    const catalogPath = `uploaded/${name}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: catalogPath,
      Expires: 5 * 60,
      ContentType: 'text/csv',
    };
    try {
      const returnUrl = s3.getSignedUrl('putObject', params);

      response.statusCode = 200;
      response.body = returnUrl;
    } catch (error) {
      console.log('Error', error);
      response.statusCode = 400;
    }

    return callback(null, response);
  } catch (error) {
    console.log('Error in createSignedLink', error);
    return callback(error);
  }
};

export const importFileParser = async (event, context, callback) => {
  try {
    console.log(
      `execution func importFileParser, Event = ${JSON.stringify(
        event
      )}, context = ${JSON.stringify(context)}, callback = ${callback}`
    );
    const s3 = new AWS.S3();
    const BucketName = 'import-cars-bucket';
    const { Records } = event;
    const sqs = new AWS.SQS();
    for (const record of Records) {
      const objectName = record.s3.object.key;
      const params = {
        Bucket: BucketName,
        Key: objectName,
      };

      await new Promise((resolve, reject) => {
        const readStream = s3.getObject(params).createReadStream();

        readStream
          .pipe(csvParser())
          .on('data', (data) => {
            sqs.sendMessage({
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify(data)
            }, (error, data) => {
              console.log('ERROR from SQS, ERROR', error);
              console.log('Data from SQS, DATA', data);
            })

          })
          .on('error', (error) => {
            reject(error);
          })
          .on('end', async (end) => {
            await s3
              .copyObject({
                Bucket: BucketName,
                CopySource: `${BucketName}/${objectName}`,
                Key: objectName.replace('uploaded', 'parsed'),
              })
              .promise();

            await s3
              .deleteObject({
                Bucket: BucketName,
                Key: objectName,
              })
              .promise();
            resolve();
          });
      });
    }
  } catch (error) {
    console.log('Error in importFileParser', error);
    callback(error);
  }
};
