'use strict';

var AWS = require('aws-sdk');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = (event, context, callback) => {

    let key;
    let prefix;
    let filetype;

    try {
        let records = event.Records;

        if (records.length !== 1) {
            callback("Error: record length invalid, " + records.length + " , event: " + event);
        } else {
            let path = records.s3.object.key;
            let itemName = path.split("/");
            key = itemName[itemName.length - 1];
            prefix = path.slice(0, path.length - key.length);
            filetype = itemName.split(".")[itemName.split(".").length - 1];
        }
    }
    catch (e) {
        callback("Error in event handling: " + e);
    }

    var params = {
        MessageBody: JSON.stringify({
            name: "" + key,
            prefix: "" + prefix,
            timestamp: Date.now()
        }),
    };

    if (filetype === "jpg" || filetype === "jpeg") {
        params.QueueUrl = "" + process.env.jpgQueue;
    }
    if (filetype === "png") {
        params.QueueUrl = "" + process.env.pngQueue;
    }

    sqs.sendMessage(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callback("Error in sqs operation: " + err);
        } else {
            console.log(data);
            callback(null, "Successfully pushed message to sqs!");
        }
    });
};
