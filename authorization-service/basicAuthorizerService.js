export const basicAuthorizer = async (event, context, callback) => {
  console.log(
    `execution func basicAuthorizer, Event = ${JSON.stringify(event)}, context = ${JSON.stringify(context)}, callback = ${callback}`
  );

  const baseCreds = event.authorizationToken;
  const buff = Buffer.from(baseCreds.replace('Basic ', ''), 'base64');
  const decodedCreds = buff.toString('utf-8').split(":");
  const username = decodedCreds[0];
  const password = decodedCreds[1];

  console.log(`decoded username = ${username}, decoded pass = ${password}`);

  const storedPass = process.env[username];
  const effect = !storedPass || storedPass !== password ? 'Deny' : 'Allow';

  const policy = generatePolicy(baseCreds, event.methodArn, effect);

  try {
  } catch (error) {
    console.log('Error in basicAuthorizer, ', error);
    return callback(error);
  }
  
  return callback(null, policy);

};


export const generatePolicy = (principalId, resourceArn, effect = 'Allow') => {
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2008-10-17",
      Statement: [
        {
            Effect: effect,
            Action: "execute-api:Invoke",
            Resource: resourceArn,
        }
    ]
    }
    
}
}