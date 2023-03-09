var thrift = require('thrift');
var UsageService = require('./gen-nodejs/UsageService');
var billing_usage_types = require("./gen-nodejs/billing_usage_types");

var transport = thrift.TFramedTransport;
var protocol = thrift.TCompactProtocol;

var host = "58.211.21.57";
var port = 19090;

var connection = thrift.createConnection(host, port, {
    transport : transport,
    protocol : protocol
});

connection.on('error', function(err) {
    console.log(err);
});

// Create a Calculator client with the connection
var client = thrift.createClient(UsageService, connection);

function callback_GetDurationUsage(err, result){
    for (var i in result){
        result[i].start = new Date(result[i].startTime * 1000);
    }
    console.log(result);
}

function callback_GetUsageByRank(err, result){
    for (var i in result.vendorUsages){
        var vendorUsage = result.vendorUsages[i];
        for (var i in vendorUsage.values){
            vendorUsage.values[i] = parseInt(vendorUsage.values[i]);
        }
    }
    console.log(JSON.stringify(result,  null, 2));
}

client.getUsageByGroup([20001], [3102], new Date("2016-12-26 17:00:00").getTime() / 1000, new Date("2016-12-26 18:00:00").getTime() / 1000, 4, callback_GetDurationUsage);

//client.getUsageByVendor(20001, [3102], new Date("2016-12-26 17:00:00").getTime() / 1000, new Date("2016-12-26 18:00:00").getTime() / 1000, 4, callback_GetDurationUsage);

//client.getUsageByVendor(0, [ 1001, 2001, 2002, 2003 ], new Date("2017-1-18 00:00:00").getTime() / 1000, new Date("2017-1-22 16:00:00").getTime() / 1000, 3, callback_GetDurationUsage);


/*
 client.getUsageByRank([20001], 20001, 1, 1, 10000000000,
 new Date("2016-12-26 17:00:00").getTime() / 1000,
 new Date("2016-12-27 17:00:00").getTime() / 1000,
 0,
 10,
 callback_GetUsageByRank
 );
 */
