//
// Autogenerated by Thrift Compiler (0.9.3)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
var thrift = require('thrift');
var Thrift = thrift.Thrift;
var Q = thrift.Q;


var ttypes = module.exports = {};
TimeSeriesData = module.exports.TimeSeriesData = function(args) {
  this.timestamp = null;
  this.value = null;
  if (args) {
    if (args.timestamp !== undefined && args.timestamp !== null) {
      this.timestamp = args.timestamp;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field timestamp is unset!');
    }
    if (args.value !== undefined && args.value !== null) {
      this.value = args.value;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field value is unset!');
    }
  }
};
TimeSeriesData.prototype = {};
TimeSeriesData.prototype.read = function(input) {
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
        this.timestamp = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.DOUBLE) {
        this.value = input.readDouble();
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

TimeSeriesData.prototype.write = function(output) {
  output.writeStructBegin('TimeSeriesData');
  if (this.timestamp !== null && this.timestamp !== undefined) {
    output.writeFieldBegin('timestamp', Thrift.Type.I32, 1);
    output.writeI32(this.timestamp);
    output.writeFieldEnd();
  }
  if (this.value !== null && this.value !== undefined) {
    output.writeFieldBegin('value', Thrift.Type.DOUBLE, 2);
    output.writeDouble(this.value);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

QueryTimeSeriesRequest = module.exports.QueryTimeSeriesRequest = function(args) {
  this.vid = null;
  this.startTime = null;
  this.endTime = null;
  this.category = null;
  if (args) {
    if (args.vid !== undefined && args.vid !== null) {
      this.vid = args.vid;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field vid is unset!');
    }
    if (args.startTime !== undefined && args.startTime !== null) {
      this.startTime = args.startTime;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field startTime is unset!');
    }
    if (args.endTime !== undefined && args.endTime !== null) {
      this.endTime = args.endTime;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field endTime is unset!');
    }
    if (args.category !== undefined && args.category !== null) {
      this.category = args.category;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field category is unset!');
    }
  }
};
QueryTimeSeriesRequest.prototype = {};
QueryTimeSeriesRequest.prototype.read = function(input) {
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
        this.startTime = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.I32) {
        this.endTime = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.category = input.readI32();
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

QueryTimeSeriesRequest.prototype.write = function(output) {
  output.writeStructBegin('QueryTimeSeriesRequest');
  if (this.vid !== null && this.vid !== undefined) {
    output.writeFieldBegin('vid', Thrift.Type.I32, 1);
    output.writeI32(this.vid);
    output.writeFieldEnd();
  }
  if (this.startTime !== null && this.startTime !== undefined) {
    output.writeFieldBegin('startTime', Thrift.Type.I32, 2);
    output.writeI32(this.startTime);
    output.writeFieldEnd();
  }
  if (this.endTime !== null && this.endTime !== undefined) {
    output.writeFieldBegin('endTime', Thrift.Type.I32, 3);
    output.writeI32(this.endTime);
    output.writeFieldEnd();
  }
  if (this.category !== null && this.category !== undefined) {
    output.writeFieldBegin('category', Thrift.Type.I32, 4);
    output.writeI32(this.category);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

QueryTimeSeriesResponse = module.exports.QueryTimeSeriesResponse = function(args) {
  this.vid = null;
  this.category = null;
  this.message = null;
  this.data = null;
  if (args) {
    if (args.vid !== undefined && args.vid !== null) {
      this.vid = args.vid;
    }
    if (args.category !== undefined && args.category !== null) {
      this.category = args.category;
    }
    if (args.message !== undefined && args.message !== null) {
      this.message = args.message;
    }
    if (args.data !== undefined && args.data !== null) {
      this.data = Thrift.copyList(args.data, [ttypes.TimeSeriesData]);
    }
  }
};
QueryTimeSeriesResponse.prototype = {};
QueryTimeSeriesResponse.prototype.read = function(input) {
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
        this.category = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.STRING) {
        this.message = input.readString();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.LIST) {
        var _size0 = 0;
        var _rtmp34;
        this.data = [];
        var _etype3 = 0;
        _rtmp34 = input.readListBegin();
        _etype3 = _rtmp34.etype;
        _size0 = _rtmp34.size;
        for (var _i5 = 0; _i5 < _size0; ++_i5)
        {
          var elem6 = null;
          elem6 = new ttypes.TimeSeriesData();
          elem6.read(input);
          this.data.push(elem6);
        }
        input.readListEnd();
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

QueryTimeSeriesResponse.prototype.write = function(output) {
  output.writeStructBegin('QueryTimeSeriesResponse');
  if (this.vid !== null && this.vid !== undefined) {
    output.writeFieldBegin('vid', Thrift.Type.I32, 1);
    output.writeI32(this.vid);
    output.writeFieldEnd();
  }
  if (this.category !== null && this.category !== undefined) {
    output.writeFieldBegin('category', Thrift.Type.I32, 2);
    output.writeI32(this.category);
    output.writeFieldEnd();
  }
  if (this.message !== null && this.message !== undefined) {
    output.writeFieldBegin('message', Thrift.Type.STRING, 3);
    output.writeString(this.message);
    output.writeFieldEnd();
  }
  if (this.data !== null && this.data !== undefined) {
    output.writeFieldBegin('data', Thrift.Type.LIST, 4);
    output.writeListBegin(Thrift.Type.STRUCT, this.data.length);
    for (var iter7 in this.data)
    {
      if (this.data.hasOwnProperty(iter7))
      {
        iter7 = this.data[iter7];
        iter7.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

TimeSeriesReport = module.exports.TimeSeriesReport = function(args) {
  this.timestamp = null;
  this.counter = null;
  this.rate = null;
  this.vid = null;
  this.category = null;
  if (args) {
    if (args.timestamp !== undefined && args.timestamp !== null) {
      this.timestamp = args.timestamp;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field timestamp is unset!');
    }
    if (args.counter !== undefined && args.counter !== null) {
      this.counter = args.counter;
    }
    if (args.rate !== undefined && args.rate !== null) {
      this.rate = args.rate;
    }
    if (args.vid !== undefined && args.vid !== null) {
      this.vid = args.vid;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field vid is unset!');
    }
    if (args.category !== undefined && args.category !== null) {
      this.category = args.category;
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field category is unset!');
    }
  }
};
TimeSeriesReport.prototype = {};
TimeSeriesReport.prototype.read = function(input) {
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
        this.timestamp = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.I32) {
        this.counter = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 3:
      if (ftype == Thrift.Type.DOUBLE) {
        this.rate = input.readDouble();
      } else {
        input.skip(ftype);
      }
      break;
      case 4:
      if (ftype == Thrift.Type.I32) {
        this.vid = input.readI32();
      } else {
        input.skip(ftype);
      }
      break;
      case 5:
      if (ftype == Thrift.Type.I32) {
        this.category = input.readI32();
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

TimeSeriesReport.prototype.write = function(output) {
  output.writeStructBegin('TimeSeriesReport');
  if (this.timestamp !== null && this.timestamp !== undefined) {
    output.writeFieldBegin('timestamp', Thrift.Type.I32, 1);
    output.writeI32(this.timestamp);
    output.writeFieldEnd();
  }
  if (this.counter !== null && this.counter !== undefined) {
    output.writeFieldBegin('counter', Thrift.Type.I32, 2);
    output.writeI32(this.counter);
    output.writeFieldEnd();
  }
  if (this.rate !== null && this.rate !== undefined) {
    output.writeFieldBegin('rate', Thrift.Type.DOUBLE, 3);
    output.writeDouble(this.rate);
    output.writeFieldEnd();
  }
  if (this.vid !== null && this.vid !== undefined) {
    output.writeFieldBegin('vid', Thrift.Type.I32, 4);
    output.writeI32(this.vid);
    output.writeFieldEnd();
  }
  if (this.category !== null && this.category !== undefined) {
    output.writeFieldBegin('category', Thrift.Type.I32, 5);
    output.writeI32(this.category);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

PutTimeSeriesRequest = module.exports.PutTimeSeriesRequest = function(args) {
  this.data = null;
  if (args) {
    if (args.data !== undefined && args.data !== null) {
      this.data = Thrift.copyList(args.data, [ttypes.TimeSeriesReport]);
    } else {
      throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field data is unset!');
    }
  }
};
PutTimeSeriesRequest.prototype = {};
PutTimeSeriesRequest.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.LIST) {
        var _size8 = 0;
        var _rtmp312;
        this.data = [];
        var _etype11 = 0;
        _rtmp312 = input.readListBegin();
        _etype11 = _rtmp312.etype;
        _size8 = _rtmp312.size;
        for (var _i13 = 0; _i13 < _size8; ++_i13)
        {
          var elem14 = null;
          elem14 = new ttypes.TimeSeriesReport();
          elem14.read(input);
          this.data.push(elem14);
        }
        input.readListEnd();
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

PutTimeSeriesRequest.prototype.write = function(output) {
  output.writeStructBegin('PutTimeSeriesRequest');
  if (this.data !== null && this.data !== undefined) {
    output.writeFieldBegin('data', Thrift.Type.LIST, 1);
    output.writeListBegin(Thrift.Type.STRUCT, this.data.length);
    for (var iter15 in this.data)
    {
      if (this.data.hasOwnProperty(iter15))
      {
        iter15 = this.data[iter15];
        iter15.write(output);
      }
    }
    output.writeListEnd();
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

PutTimeSeriesResponse = module.exports.PutTimeSeriesResponse = function(args) {
  this.success = null;
  this.message = null;
  if (args) {
    if (args.success !== undefined && args.success !== null) {
      this.success = args.success;
    }
    if (args.message !== undefined && args.message !== null) {
      this.message = args.message;
    }
  }
};
PutTimeSeriesResponse.prototype = {};
PutTimeSeriesResponse.prototype.read = function(input) {
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
      if (ftype == Thrift.Type.BOOL) {
        this.success = input.readBool();
      } else {
        input.skip(ftype);
      }
      break;
      case 2:
      if (ftype == Thrift.Type.STRING) {
        this.message = input.readString();
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

PutTimeSeriesResponse.prototype.write = function(output) {
  output.writeStructBegin('PutTimeSeriesResponse');
  if (this.success !== null && this.success !== undefined) {
    output.writeFieldBegin('success', Thrift.Type.BOOL, 1);
    output.writeBool(this.success);
    output.writeFieldEnd();
  }
  if (this.message !== null && this.message !== undefined) {
    output.writeFieldBegin('message', Thrift.Type.STRING, 2);
    output.writeString(this.message);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

