var thrift = require("thrift");
var UsageService = require('./gen-nodejs/UsageService');
var billing_usage_types = require("./gen-nodejs/billing_usage_types");
var path = require("path");
var fs = require("fs");

function hashDec(str){
  str = str.toString();
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return (hash % 50 + 50) / 100;
}

function loadStaticRecordsSync(){
    var records = {};
    var pathStaticTables = path.join(__dirname, "../..", "record-source");
    var tableNames = fs.readdirSync(pathStaticTables);
    for (var i in tableNames){
        var tableName = tableNames[i];
        var pathTable = path.join(pathStaticTables, tableName);
        if (tableName.indexOf(".") != -1){
            sails.log("Ignoring static table(folder) " + pathTable);
            continue;
        }
        records[tableName] = {};
        var recordFileNames = fs.readdirSync(pathTable);
        for (var j in recordFileNames){
            var recordFileName = recordFileNames[j];
            var pathRecordFile = path.join(pathTable, recordFileName);
            if (recordFileName.indexOf(".json") == -1){
                sails.log("Ignoring static record(file) " + pathRecordFile);
                continue;
            }
            var content = fs.readFileSync(pathRecordFile);
            var record = JSON.parse(content);
            records[tableName][record.id] = record;
        }
    }
    return records;
}

global.RecordSource = loadStaticRecordsSync();

var data = {};

var server = thrift.createServer(UsageService, {
    ping: function(str, result) {
        console.log("ping()", str);
        result(null, "pong " + str);
    },

    getUsageByVendor: function(vid, skus, fromTs, toTs, interval, callback){
        this.getUsageByGroup([vid], skus, fromTs, toTs, interval, callback);
    },

    getUsageByRank: function(skus, skuRank, isDescend, minValue, maxValue, fromTs, toTs, offset, limit, callback){
        var usages = [];
        for (var vid = 20001; vid < 20500; vid++){
            var vendorUsage = {vid: vid, values:{}};
            for(var k in skus) {
                var sku = skus[k];
                var sumOfInterval = 0;
                for (var l = fromTs; l < toTs; l += 5 * 60) {
                    var hash = hashDec("" + vid + sku);
                    var value = Math.sin(l / 100 / 3600 * hash / 5 + hash);
                    sumOfInterval += Math.floor(Math.abs(100 * hash * value));
                }
                vendorUsage.values[sku] = sumOfInterval;
                //console.log("sku", sku, "value", sumOfInterval);
            }
            if (vendorUsage.values[skuRank] <= maxValue && vendorUsage.values[skuRank] >= minValue){
                usages.push(vendorUsage);
            }
        }
        usages = usages.sort(function(vendorUsage1, vendorUsage2){
            var min = vendorUsage1.values["" + skuRank] - vendorUsage2.values["" + skuRank];

            //console.log(value);
            return isDescend ? -min : min;
        });
        var vendorUsages = usages.slice(offset, offset + limit);
        callback(null, {
            skuRank: skuRank,
            isDescend: isDescend,
            vendorUsages: vendorUsages,
            offset: offset,
            limit: limit,
            totalCount: usages.length
        });
    },

    getUsageByGroup: function(vids, skus, fromTs, toTs, interval, callback){
      fromTs = parseInt(fromTs);
      toTs = parseInt(toTs);
      console.log(fromTs, toTs, interval, RecordSource.usageInterval);
      var intervalseconds = 1;
      switch(interval){
          case 1:
              intervalseconds *= 30;
          case 2:
              intervalseconds *= 24;
          case 3:
              intervalseconds *= 12;
          case 4:
              intervalseconds *= 5 * 60;
      }
      var result = [];
      for (var i in skus){
        var sku = skus[i];
            for (var j = Number(fromTs); j < toTs; j+= intervalseconds){
              var sumOfInterval = 0;
                for (var k in vids){
                    var vid = vids[k];
                    for (var l = j; l < j + intervalseconds; l += 5 * 60){
                        var hash = hashDec("" + vid + sku);
                        var value = Math.sin(l / 100 / 3600 * hash / 5  + hash);
                        sumOfInterval += Math.floor(Math.abs(100 * hash * value));
                        //console.log(value);
                    }
                }


              result.push({
                vid : vid,
                sku : sku,
                value: vid ? sumOfInterval : sumOfInterval * 1377,
                startTime: j,
                interval: interval
              });
            }
      }
      /*
      console.log("getDurationUsage",
        "vids:", vids, ", skus:", skus, "interval", interval,
        "\nfrom", new Date(fromTs), ", to", new Date(toTs), "\n",
        JSON.stringify(result)
      );
      */
      callback(null, result);
    },

    calculate: function(logid, work, result) {
        console.log("calculate(", logid, ",", work, ")");

        var val = 0;
        if (work.op == ttypes.Operation.ADD) {
            val = work.num1 + work.num2;
        } else if (work.op === ttypes.Operation.SUBTRACT) {
            val = work.num1 - work.num2;
        } else if (work.op === ttypes.Operation.MULTIPLY) {
            val = work.num1 * work.num2;
        } else if (work.op === ttypes.Operation.DIVIDE) {
            if (work.num2 === 0) {
                var x = new ttypes.InvalidOperation();
                x.whatOp = work.op;
                x.why = 'Cannot divide by 0';
                result(x);
                return;
            }
            val = work.num1 / work.num2;
        } else {
            var x = new ttypes.InvalidOperation();
            x.whatOp = work.op;
            x.why = 'Invalid operation';
            result(x);
            return;
        }

        var entry = new SharedStruct();
        entry.key = logid;
        entry.value = ""+val;
        data[logid] = entry;

        result(null, val);
    },

    getStruct: function(key, result) {
        console.log("getStruct(", key, ")");
        result(null, data[key]);
    },

    zip: function() {
        console.log("zip()");
        result(null);
    },



});

server.listen(9090);
