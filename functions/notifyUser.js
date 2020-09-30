const AWS = require("aws-sdk");

const { ORDER_ACCEPTED, USER_NOTIFIED } = require("../constants/order");
const { getRecords } = require("../libs/kinesis");

const kinesis = new AWS.Kinesis();
const sns = new AWS.SNS();

const streamName = process.env.orderEventStream;
const topicArn = process.env.userNotificationTopic;

const notifyUser = async (event) => {
  const records = getRecords(event);
  const orderAccepted = records.filter(
    ({ eventType }) => eventType === ORDER_ACCEPTED
  );

  for (let order of orderAccepted) {
    const snsPayload = {
      Message: JSON.stringify(order),
      TopicArn: topicArn,
    };

    await sns.publish(snsPayload).promise();

    const { userEmail, orderId } = order;

    console.log(`notified user [${userEmail}] of order [${orderId}]`);

    const eventType = USER_NOTIFIED;

    const data = {
      ...order,
      eventType,
    };

    const kinesisPayload = {
      Data: JSON.stringify(data),
      PartitionKey: orderId,
      StreamName: streamName,
    };

    await kinesis.putRecord(kinesisPayload).promise();

    console.log(`Published ${eventType} event into Kinesis`);
  }
};

module.exports.handler = notifyUser;
