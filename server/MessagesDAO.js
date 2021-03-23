var AWS = require("aws-sdk");

AWS.config.update({
  endpoint: "https://dynamodb.us-east-2.amazonaws.com",
  region: "us-east-2",
});
const TABLE = "messages";

AWS.config.getCredentials(function (err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
        console.log("Access key:", AWS.config.credentials.accessKeyId);
        console.log("Region: ", AWS.config.region);
    }
});

async function putMessage(receiverId, timestamp, senderId, message) {
  var client = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName: TABLE,
      Item: {
          "receiver_id": receiverId,
          "timestamp": timestamp,
          "sender_id": senderId,
          "message": message
      }
  };
  client.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item for the following reason: ", JSON.stringify(err));
      } else {
          console.log("Added item: ", JSON.stringify(data));
      }
  });
}

async function getMessages(receiverId) {
    var client = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName : TABLE,
        KeyConditionExpression: "#receiver = :value",
        ExpressionAttributeNames:{
            "#receiver": "receiver_id"
        },
        ExpressionAttributeValues: {
            ":value": receiverId
        }
    };
    
    var data = await client.query(params).promise()
    return data.Items
}

module.exports = {
    putMessage,
    getMessages
};