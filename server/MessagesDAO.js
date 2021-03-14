var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
  endpoint: "http://localhost:4000"
  // endpoint: "http://Gettingstartedapp-env.eba-sm3mz4hp.us-east-2.elasticbeanstalk.com"
});
var TABLE = "messages";


async function putMessage(userId, timestamp, receiverName, message) {
  var client = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName: TABLE,
      Item: {
          "user_id": userId,
          "timestamp": timestamp,
          "receiver_name": receiverName,
          "message": message
      }
  };
  client.put(params, function(err, data) {
      if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err));
      } else {
          console.log("Added item:", JSON.stringify(data));
      }
  });
}

module.exports = {
  putMessage
}