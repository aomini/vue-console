import { generate } from 'shortid';
import { v4 } from 'uuid';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { config } from '../config';

const DEFAULT_EMAIL_SIGN_SECRET = '2RJvhc9R';
const ENC_LOOPS = 8193;
const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const generateUUID = () => {
  const data = v4();
  return data.replace(/-/g, ''); // 替换uuid 中的破折号
};

export const generateShortId = () => {
  return generate();
};

export const md5 = (source) => {
  const md5Hash = crypto.createHash('md5');
  md5Hash.update(source);

  return md5Hash.digest();
};

export const sha1HEX = (str: string) => {
  return crypto.createHash('sha1').update(str).digest('hex');
};

export const sha256HEX = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export const createProjectSignkeyMD5 = (companyId, projectId, enable, expiredTs) => {
  const source = Buffer.from(companyId + projectId + enable + expiredTs);
  const sign = md5(source).toString('hex');
  return sign;
};

export const generateEmailSign = (expireTimeHex, email) => {
  return md5(DEFAULT_EMAIL_SIGN_SECRET + expireTimeHex + email).toString('hex');
};

export const encode64 = (input, count) => {
  let output = '';
  let i = 0;
  do {
    let value = input[i++];

    output += itoa64[value & 0x3f];
    if (i < count) {
      value |= input[i] << 8;
    }

    output += itoa64[(value >> 6) & 0x3f];
    if (i++ >= count) {
      break;
    }

    if (i < count) {
      value |= input[i] << 16;
    }

    output += itoa64[(value >> 12) & 0x3f];
    if (i++ >= count) {
      break;
    }

    output += itoa64[(value >> 18) & 0x3f];
  } while (i < count);

  return output;
};

export const generateUsageAPISign = (url) => {
  const hash = md5(url);
  const result = hash.toString('base64');
  return result;
};

export const generateMessageAPISign = (url) => {
  const md5Hash = crypto.createHash('md5');
  const result = md5Hash.update(url).digest('hex');
  return result;
};

export const generateSalt = () => {
  const buf = crypto.randomBytes(64);
  return encode64(buf, 6);
};

export const cryptPrivate = (input_password, salt, loops) => {
  let hash = Buffer.from(salt);
  const buffPwd = Buffer.from(input_password);

  if (!loops) {
    loops = ENC_LOOPS;
  }

  while (loops--) {
    const buf = Buffer.concat([hash, buffPwd]);
    hash = md5(buf);
  }

  return encode64(hash, 16);
};

export const generateTransactionId = () => {
  let t = '';
  for (let i = 0; i < 5; i++) {
    t += Math.floor(Math.random() * 10);
  }
  t += moment().unix();
  return t;
};

export const generateToken = (email: string) => {
  const emailExpireMs = 24 * 3600 * 1000;
  const expireTime = Date.now() + emailExpireMs;
  const expireTimeHex = expireTime.toString(16);
  const token = [expireTimeHex, generateEmailSign(expireTimeHex, email)].join('|');
  return token;
};

const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = Buffer.from(config.paymentTokenSecret.secret, 'base64');
const IV_LENGTH = 16;

export const encryptPurchaseToken = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptPurchaseToken = (text: string) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const signAlgorithm = 'aes-256-ctr';
const SIGN_IV_LENGTH = 16;

export const encryptToken = (text: string, signKey: Buffer) => {
  const iv = crypto.randomBytes(SIGN_IV_LENGTH);
  const cipher = crypto.createCipheriv(signAlgorithm, signKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decryptToken = (text: string, signKey: Buffer) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(signAlgorithm, signKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
