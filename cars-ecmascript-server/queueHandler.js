import AWS from 'aws-sdk';
import { putProductInDB } from './createProduct';

export const catalogBatchProcess = async (event, context, callback) => {
  console.log(
    `execution func catalogBatchProcess, Event = ${JSON.stringify(
      event
    )}, context = ${JSON.stringify(context)}, callback = ${callback}`
  );

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };

  try {
    for (const record of event.Records) {
      const { body: productRaw } = record;
      const product = JSON.parse(productRaw);

      try {
        await putProductInDB(product);
        const sns = new AWS.SNS({region: 'eu-west-1'});
        sns.publish({
          Subject: 'SNS subscription Title',
          Message: `product created ${JSON.stringify(product)}`,
          TopicArn: process.env.SNS_URL,
          MessageAttributes: {
            numberCounter: {
              DataType: 'Number',
              StringValue: String(product.count)
            }
          }
        }, (error, data) => {
          console.log('Error in SNS send', error);
          console.log('Data from SNS send', data);
        })
      } catch (error) {
        console.log('error in catalogBatchProcess, putProduct', error);
      }
    }

    return callback(null, response);
  } catch (error) {
    console.log('Error in createProduct', error);
    return callback(new Error(`[500] Internal error, ${error.errorMessage}`));
  }
};
