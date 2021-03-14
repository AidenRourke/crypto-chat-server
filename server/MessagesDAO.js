var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-2",
    endpoint: "https://dynamodb.us-east-2.amazonaws.com",
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log(process.env.AWS_PROFILE)

AWS.config.getCredentials(function (err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
        console.log("Access key:", AWS.config.credentials.accessKeyId);
        console.log("Region: ", AWS.config.region);
    }
});

async function putMessage(userId, timestamp, receiverId, message) {
    var TABLE = "messages";
    var params = {
        TableName: TABLE,
        Item: {
            "user_id": userId,
            "timestamp": `${timestamp}`,
            "receiver_id": receiverId,
            "message": message
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err));
        } else {
            console.log("Added item:", JSON.stringify(data));
        }
    });
}

module.exports = {
    putMessage
};