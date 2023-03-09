const util = require("util");
const { getRecordByName } = require('./RecordSourceManager');
const thrift = require('thrift');
const path = require('path');

const clients = {};

let id = 0;
function getClient(serviceName){

    const microServiceRecord = getRecordByName(serviceName);
    if (!microServiceRecord){
        util.log('Cannot get microServiceRecord ' + serviceName);
        return null;
    }else if (microServiceRecord.type == 'thrift'){
        const connection = thrift.createConnection(microServiceRecord.thrift_host, microServiceRecord.thrift_port, {
            // connect_timeout: 1000,
            // timeout: 1000,
            transport : thrift[microServiceRecord.thrift_transport],
            protocol : thrift[microServiceRecord.thrift_protocol]
        });
        const service = require(path.join('../services/', microServiceRecord.thrift_path_service));
        const client = thrift.createClient(service, connection);
        client.clientId = id++;
        clients[client.clientId] = client;
        connection.on('error', function(err) {
            util.log('MicroService Connection Error #' + client.clientId + " " + serviceName + ' ' + util.inspect(err));
            delete clients[client.clientId];
        });

        connection.on('connect',function (e) {
            // console.log("connection", e)
        });
        connection.on('close', function() {
            delete clients[client.clientId];
        });
        connection.on('timeout', function(err) {
            util.log('MicroService Connection Timeout #' + client.clientId + " " + serviceName + ' ' + util.inspect(err));
            delete clients[client.clientId];
        });
        client.ttypes = require(path.join('../services/', microServiceRecord.thrift_path_ttype));
        client.connection = connection;
        return client;
    }
}

setInterval(function(){
    const clientCount = Object.keys(clients).length;
    if (clientCount){
        util.log("Micro Service Manager Client Count:" + clientCount);
    }
}, 5000);

module.exports.getClient = getClient;
