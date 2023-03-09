import { randomBytes, createHmac } from 'crypto';
import { Buffer } from 'buffer';
import { v1 } from 'uuid';
import { encode } from 'urlsafe-base64';
import { config } from '../config';
import * as CryptoJS from 'crypto-js';

const uuidBytesLength = 16;
const uuidBytes: number[] = [];
const uuidBuffer: Buffer = Buffer.alloc(uuidBytesLength);

export const createRandomKey = (bytes: number): string => {
  return encode(randomBytes(bytes));
};

export const createURLSafeBase64UUID = (): string => {
  return encode(createUUID());
};

export const createHexUUID = (): string => {
  return createUUID().toString('hex');
};

function createUUID(): Buffer {
  const bytes: number[] = v1(undefined, uuidBytes);
  for (let i = 0; i < uuidBytesLength; ++ i) {
    uuidBuffer.writeUInt8(bytes[i], i);
  }
  return uuidBuffer;
}

export enum TokenRole {
  // 数字越小，权限越大
  Admin = '0',
  Writer = '1',
  Reader = '2'
}

export enum TokenPrefix {
  SDK = 'NETLESSSDK_',
  ROOM = 'NETLESSROOM_',
  TASK = 'NETLESSTASK_'
}

// buffer 转 base64，且格式化字符
const bufferToBase64 = (buffer: Buffer): string => {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// 序列化对象
const stringify = (object: StrByObj): string => {
  return Object.keys(object)
      .map(key => {
        const value = object[key];

        if (value === undefined) {
          return '';
        }

        if (value === null) {
          return 'null';
        }

        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
};

// 排序，以确保最终生成的 string 与顺序无关
// keys 的顺序不应该影响 hash 的值
const formatJSON = <T extends StrAndIntByObj>(object: T): StrByObj => {
  const keys = Object.keys(object).sort();
  const target: StrByObj = {};

  for (const key of keys) {
    target[key] = String(object[key]);
  }
  return target;
};

// 根据相关 prefix 生成相应的token
const createToken = <T extends {}>(
  prefix: TokenPrefix
): ((accessKey: string, secretAccessKey: string, lifespan: number, content: T) => string) => {
  return (accessKey: string, secretAccessKey: string, lifespan: number, content: T) => {
    const object: StrAndIntByObj = {
      ...content,
      ak: accessKey,
      nonce: v1()
    };

    if (lifespan > 0) {
      object.expireAt = `${Date.now() + lifespan}`;
    }

    const information = JSON.stringify(formatJSON(object));
    const hmac = createHmac('sha256', secretAccessKey);
    object.sig = hmac.update(information).digest('hex');

    const query = stringify(formatJSON(object));
    const buffer = Buffer.from(query, 'utf8');

    return prefix + bufferToBase64(buffer);
  };
};

// 生成 sdk token
export const sdkToken = createToken<SdkTokenTags>(TokenPrefix.SDK);

export type SdkTokenTags = {
  readonly role?: TokenRole;
};

type StrAndIntByObj = Record<string, string | number>;
type StrByObj = Record<string, string>;

export function AESWithDecrypt(word: string): string {
  const key = config.Netless.AESKey;
  const cipherKey = CryptoJS.enc.Utf8.parse(key);
  const iv = CryptoJS.enc.Utf8.parse(key);

  const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  const parseWord = CryptoJS.enc.Base64.stringify(encryptedHexStr);

  const decrypt = CryptoJS.AES.decrypt(parseWord, cipherKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);

  return decryptedStr.toString();

}

export function AESWithEncrypt(word: string): string {
  const key = config.Netless.AESKey;
  const cipherKey = CryptoJS.enc.Utf8.parse(key);
  const iv = CryptoJS.enc.Utf8.parse(key);
  const parseWords = CryptoJS.enc.Utf8.parse(word);

  const encrypted = CryptoJS.AES.encrypt(parseWords, cipherKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.ciphertext.toString();

}
