const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const kinesis = new AWS.Kinesis();

const streamName = process.env.orderEventStream;

const placeOrder = async (event) => {
  const restaurantName = JSON.parse(event.body).restaurantName;

  const userEmail = event.requestContext.authorizer.claims.email;

  const orderId = uuidv4();
  console.log(
    `Placing order ID ${orderId} to ${restaurantName} from user ${userEmail}`
  );

  const eventType = "order_placed";

  const data = {
    orderId,
    userEmail,
    restaurantName,
    eventType,
  };

  const payload = {
    Data: JSON.stringify(data),
    PartitionKey: orderId,
    StreamName: streamName,
  };

  await kinesis.putRecord(payload).promise();

  console.log(`Published ${eventType} to Kinesis`);

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};

module.exports.handler = placeOrder;
