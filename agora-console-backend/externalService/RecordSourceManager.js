var path = require("path");
var fs = require("fs");
var util = require("util");

var allRecords = {};
allRecords.byName = {}; //workaround

function getRecordByName(recordName){
    for(var tableName in allRecords){
        if (tableName == "byName") continue;
        var table = allRecords[tableName];
        for (var recordId in table){
            var record = table[recordId];
            if (record.name == recordName){
                return record;
            }
        }
    }
    return null;
}

function loadStaticRecordsSync(pathTables, recordSet){

    // 删除当前数据集
    for (var tableName in recordSet){
        if (allRecords[tableName]){
            if (recordSet[tableName]){
                util.log("Flushing Record Source " + tableName);
                delete allRecords[tableName];
                delete recordSet[tableName];
            }else{
                util.log("Error: Conflicting table name: " + tableName);
                process.exit();
            }
        }
    }

    // 增加数据集
    var tableNames = fs.readdirSync(pathTables);
    for (var i in tableNames){
        var tableName = tableNames[i];
        var pathTable = path.join(pathTables, tableName);
        if (tableName.indexOf(".") != -1){
            util.log("Ignoring Record Source table(folder) " + pathTable);
            continue;
        }

        // 判断表名冲突
        if (allRecords[tableName] || recordSet[tableName]){
            util.log("Duplicated table " + tableName);
            process.exit();
        }else{
            allRecords[tableName] = {};
            recordSet[tableName] = {};
        }

        var recordFileNames = fs.readdirSync(pathTable);
        for (var j in recordFileNames){
            var recordFileName = recordFileNames[j];
            var pathRecordFile = path.join(pathTable, recordFileName);
            if (recordFileName.indexOf(".json") == -1){
                util.log("Ignoring Record Source static record(file) " + pathRecordFile);
                continue;
            }
            try{
                var content = fs.readFileSync(pathRecordFile);
                var record = JSON.parse(content);
            }catch(e){
                console.error(e);
                console.error(pathRecordFile);
                process.exit();
            }

            if (recordSet[tableName][record.id]){
                // 判断记录ID冲突
                util.log("Dulplicated record " + record.id + util.inspect(record) + util.inspect(recordSet[tableName][record.id]));
                process.exit();
            }else if (getRecordByName(record.name)){
                // 判断记录名全数据集冲突
                util.log("Duplicated record name " + record.name + " " + util.inspect(record) + util.inspect(getRecordByName(record.name)));
                process.exit();
            }
            else{
                recordSet[tableName][record.id] = record;
                allRecords[tableName][record.id] = record;
                allRecords.byName[record.name] = record;
            }
        }
    }
}

var pathPublicTables = path.join(__dirname, "..","metaData", "record-source");
var pathPrivateTables = path.join(__dirname, "..","metaData",  "record-source-private");

var publicRecords = {};
var privateRecords = {};

loadStaticRecordsSync(pathPublicTables, publicRecords);
loadStaticRecordsSync(pathPrivateTables, privateRecords);

module.exports.getRecordByName = getRecordByName;
module.exports.allRecords = allRecords;
