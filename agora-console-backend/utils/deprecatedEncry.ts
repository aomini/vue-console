
import * as crypto from 'crypto';

const numberToHex = function (v) {
  if (typeof (v) === 'number') {
    return v.toString(16);
  } else {
    return v;
  }
};

const hexToNumber = function (v) {
  return parseInt(v, 16);
};

const md5 = function (source) {
  const md5 = crypto.createHash('md5');
  md5.update(source);

  return md5.digest();
};

export const generateSignToken = function (secret, startTime, maxAge, fields) {
  const input = [1, secret, startTime, maxAge].concat(fields);
  const sign = md5(input.join('#')).toString('hex');
  let tokenParams = [1, startTime, maxAge].concat(fields);
  tokenParams.push(sign);

  tokenParams = tokenParams.map(numberToHex);

  const token = tokenParams.join('|');
  return token;
};

export const validateTokenSign = function (secret, token) {
  const params = token.split('|');
  const startTime = hexToNumber(params[1]);

  const maxAge = hexToNumber(params[2]);
  const expires = startTime + maxAge;
  if (expires < new Date().getTime()) {
    return false;
  }

  let fields = params.slice(3, params.length - 1);
  fields = fields.map(hexToNumber);

  const testToken = generateSignToken(secret, startTime, maxAge, fields);

  return testToken === token;
};

export const validateTokenExpired = function (token) {
  const params = token.split('|');
  const startTime = hexToNumber(params[1]);

  const maxAge = hexToNumber(params[2]);
  const expires = startTime + maxAge;
  if (expires < new Date().getTime()) {
    return false;
  }
  return true;
};

export const getAccountInfo = function (token: string) {
  const params = token.split('|');
  return { accountId: parseInt(params[3], 16), isMember: parseInt(params[5], 16) === 1 };
};

export const generateOSSKey = function (companyId: number, filename: string) {
  return `dashboard/identity/${companyId}/${filename}`;
};

export const generatePaasOSSKey = function (companyId: number, filename: string) {
  return `dashboard/paas/${companyId}/${filename}`;
};
