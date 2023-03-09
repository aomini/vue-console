import { createConnection } from 'typeorm';
import { NetlessStorage } from '../models/netlessStorage';
import { AESWithDecrypt, AESWithEncrypt } from '../utils/netless';
import { config } from '../config';

createConnection({
  type: 'mysql',
  host: config.mysql.dashboard.host,
  port: config.mysql.dashboard.port,
  username: config.mysql.dashboard.username,
  password: config.mysql.dashboard.password,
  database: 'dashboard',
  logger: 'simple-console',
  entities: ['../models/*{.ts,.js}']
}).then(async connection => {
  const storages = await NetlessStorage.find();
  let count = 0;
  for (const storage of storages) {
    console.log(`count: ${count}`);
    const sk = storage.sk;
    console.log(`SK: ${sk}`);
    try {
      const decryptsk = AESWithDecrypt(sk);
      console.log(`decryptsk: ${decryptsk}`);
      if (!decryptsk) {
        storage.sk = AESWithEncrypt(sk);
        await storage.save();
      }
    } catch (e) {
      console.log(`decryptsk error`);
      console.log(e);
      storage.sk = AESWithEncrypt(sk);
      await storage.save();
    }
    count ++;
  }
}).catch((e) => {
  console.log(e);
  console.log('error');
});
