//
// Autogenerated by Thrift Compiler (0.11.0)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
"use strict";

var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;


var ttypes = module.exports = {};
var UsageItem = module.exports.UsageItem = function(args) {
  this.vid = null;
  this.sku = null;
  this.startTime = null;
  this.value = null;
  if (args) {
    if (args.vid !== undefined && args.vid !== null) {
      this.vid = args.vid;
    }
    if (args.sku !== undefined && args.sku !== null) {
      this.sku = args.sku;
    }
    if (args.startTime !== undefined && args.startTime !== null) {
      this.startTime = args.startTime;
    }
    if (args.value !== undefined && args.value !== null) {
      this.value = args.value;
    }
  }
};
UsageItem.prototype = {};
UsageItem.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.I32) {
        this.vid = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I32) {
        this.sku = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I32) {
        this.startTime = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I64) {
        this.value = input.readI64();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

UsageItem.prototype.write = function(output) {
  output.writeStructBegin('UsageItem');
  if (this.vid !== null && this.vid !== undefined) {
    output.writeFieldBegin('vid', Thrift.Type.I32, 1);
    output.writeI32(this.vid);
    output.writeFieldEnd();
  }
  if (this.sku !== null && this.sku !== undefined) {
    output.writeFieldBegin('sku', Thrift.Type.I32, 2);
    output.writeI32(this.sku);
    output.writeFieldEnd();
  }
  if (this.startTime !== null && this.startTime !== undefined) {
    output.writeFieldBegin('startTime', Thrift.Type.I32, 3);
    output.writeI32(this.startTime);
    output.writeFieldEnd();
  }
  if (this.value !== null && this.value !== undefined) {
    output.writeFieldBegin('value', Thrift.Type.I64, 4);
    output.writeI64(this.value);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var VendorUsage = module.exports.VendorUsage = function(args) {
  this.vid = null;
  this.values = null;
  if (args) {
    if (args.vid !== undefined && args.vid !== null) {
      this.vid = args.vid;
    }
    if (args.values !== undefined && args.values !== null) {
      this.values = Thrift.copyMap(args.values, [null]);
    }
  }
};
VendorUsage.prototype = {};
VendorUsage.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.I32) {
        this.vid = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.MAP) {
        var _size0 = 0;
        var _rtmp34;
        this.values = {};
        var _ktype1 = 0;
        var _vtype2 = 0;
        _rtmp34 = input.readMapBegin();
        _ktype1 = _rtmp34.ktype;
        _vtype2 = _rtmp34.vtype;
        _size0 = _rtmp34.size;
        for (var _i5 = 0; _i5 < _size0; ++_i5)
        {
          var key6 = null;
          var val7 = null;
          key6 = input.readI32();
          val7 = input.readI64();
          this.values[key6] = val7;
        }
        input.readMapEnd();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

VendorUsage.prototype.write = function(output) {
  output.writeStructBegin('VendorUsage');
  if (this.vid !== null && this.vid !== undefined) {
    output.writeFieldBegin('vid', Thrift.Type.I32, 1);
    output.writeI32(this.vid);
    output.writeFieldEnd();
  }
  if (this.values !== null && this.values !== undefined) {
    output.writeFieldBegin('values', Thrift.Type.MAP, 2);
    output.writeMapBegin(Thrift.Type.I32, Thrift.Type.I64, Thrift.objectLength(this.values));
    for (var kiter8 in this.values)
    {
      if (this.values.hasOwnProperty(kiter8))
      {
        var viter9 = this.values[kiter8];
        output.writeI32(kiter8);
        output.writeI64(viter9);
      }
    }
    output.writeMapEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var Pagination = module.exports.Pagination = function(args) {
  this.skuRank = null;
  this.isDescend = null;
  this.vendorUsages = null;
  this.offset = null;
  this.limit = null;
  this.totalCount = null;
  if (args) {
    if (args.skuRank !== undefined && args.skuRank !== null) {
      this.skuRank = args.skuRank;
    }
    if (args.isDescend !== undefined && args.isDescend !== null) {
      this.isDescend = args.isDescend;
    }
    if (args.vendorUsages !== undefined && args.vendorUsages !== null) {
      this.vendorUsages = Thrift.copyList(args.vendorUsages, [ttypes.VendorUsage]);
    }
    if (args.offset !== undefined && args.offset !== null) {
      this.offset = args.offset;
    }
    if (args.limit !== undefined && args.limit !== null) {
      this.limit = args.limit;
    }
    if (args.totalCount !== undefined && args.totalCount !== null) {
      this.totalCount = args.totalCount;
    }
  }
};
Pagination.prototype = {};
Pagination.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.I32) {
        this.skuRank = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.BOOL) {
        this.isDescend = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.LIST) {
        var _size10 = 0;
        var _rtmp314;
        this.vendorUsages = [];
        var _etype13 = 0;
        _rtmp314 = input.readListBegin();
        _etype13 = _rtmp314.etype;
        _size10 = _rtmp314.size;
        for (var _i15 = 0; _i15 < _size10; ++_i15)
        {
          var elem16 = null;
          elem16 = new ttypes.VendorUsage();
          elem16.read(input);
          this.vendorUsages.push(elem16);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.offset = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.I32) {
        this.limit = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 6:
      if (ftype == Thrift.Type.I32) {
        this.totalCount = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Pagination.prototype.write = function(output) {
  output.writeStructBegin('Pagination');
  if (this.skuRank !== null && this.skuRank !== undefined) {
    output.writeFieldBegin('skuRank', Thrift.Type.I32, 1);
    output.writeI32(this.skuRank);
    output.writeFieldEnd();
  }
  if (this.isDescend !== null && this.isDescend !== undefined) {
    output.writeFieldBegin('isDescend', Thrift.Type.BOOL, 2);
    output.writeBool(this.isDescend);
    output.writeFieldEnd();
  }
  if (this.vendorUsages !== null && this.vendorUsages !== undefined) {
    output.writeFieldBegin('vendorUsages', Thrift.Type.LIST, 3);
    output.writeListBegin(Thrift.Type.STRUCT, this.vendorUsages.length);
    for (var iter17 in this.vendorUsages)
    {
      if (this.vendorUsages.hasOwnProperty(iter17))
      {
        iter17 = this.vendorUsages[iter17];
        iter17.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  if (this.offset !== null && this.offset !== undefined) {
    output.writeFieldBegin('offset', Thrift.Type.I32, 4);
    output.writeI32(this.offset);
    output.writeFieldEnd();
  }
  if (this.limit !== null && this.limit !== undefined) {
    output.writeFieldBegin('limit', Thrift.Type.I32, 5);
    output.writeI32(this.limit);
    output.writeFieldEnd();
  }
  if (this.totalCount !== null && this.totalCount !== undefined) {
    output.writeFieldBegin('totalCount', Thrift.Type.I32, 6);
    output.writeI32(this.totalCount);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

