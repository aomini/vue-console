import { createConnection, getManager } from 'typeorm';
import { NetlessService } from '../models/netlessService';
import { NetlessConcurrent } from '../models/netlessConcurrent';
import { NetlessStorage } from '../models/netlessStorage';
import { exit } from 'shelljs';
import { generateUUID } from '../utils/encryptTool';
// tslint:disable-next-line:no-require-imports
const csvtojson = require('csvtojson');

async function importServiceConfigAndStorage(dataRegion: string) {
  const serviceCsvFilePath = `/Users/xqf/Desktop/${dataRegion}/services.csv`;
  const storageCsvFilePath = `/Users/xqf/Desktop/${dataRegion}/storagedrivers.csv`;
  const serviceDB = getManager().getRepository(NetlessService);
  const storageDB = getManager().getRepository(NetlessStorage);
  let serviceData: any = [];
  let storageData: any = [];
  await csvtojson().fromFile(serviceCsvFilePath).then(async source => {
    serviceData = source;
  });
  await csvtojson().fromFile(storageCsvFilePath).then(async source => {
    storageData = source;
  });
  // 插入 storage 数据
  for (let i = 0; i < storageData.length; i ++) {
    const item = storageData[i];
    const storage = new NetlessStorage();
    const originId = item['id'];
    console.log(`storageId: ${originId}`);
    storage.uid = generateUUID();
    storage.provider = item['provider'];
    storage.ak = item['ak'];
    storage.sk = item['sk'];
    storage.bucket = item['bucket'];
    storage.region = item['region'];
    storage.domain = item['domain'];
    storage.path = item['path'];
    storage.teamUUID = item['teamUUID'];
    storage.dataRegion = dataRegion;
    try {
      const newStorage = await storageDB.save(storage);
      const id = newStorage.id;
      const serviceItem = serviceData.filter((item: any) => {
        return JSON.parse(item.configuration)['storageDriverId'] === Number(originId);
      });
      serviceItem.forEach((item1) => {
        const searchServiceItemIndex = serviceData.findIndex((item3) => {
          return item1.id === item3.id;
        });
        if (searchServiceItemIndex !== -1) {
          const newConfiguration = {
            storageDriverId: Number(id)
          };
          serviceData[searchServiceItemIndex]['configuration'] = JSON.stringify(newConfiguration);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  console.log(serviceData);
  // 插入 service 数据
  for (let i = 0; i < serviceData.length; i ++) {
    const item = serviceData[i];
    const appUUID = item['appId'];
    const isEnabled = item['enable'];
    const type = item['type'];
    const configuration = item['configuration'];
    const teamUUID = item['teamUUID'];
    const service = new NetlessService();
    service.teamUUID = teamUUID;
    service.appUUID = appUUID;
    service.configuration = configuration;
    service.isEnabled = isEnabled;
    service.type = type;
    service.dataRegion = dataRegion;
    console.log(`appUUID: ${service.appUUID}; teamUUID: ${service.teamUUID}; configuration: ${service.configuration}; isEnabled: ${service.isEnabled}; type: ${service.type}; data_region: ${service.dataRegion}`);
    try {
      await serviceDB.save(service);
    } catch (e) {
      console.log(e);
    }
  }
}

async function importConcurrent(dataRegion: string) {
  const csvFilePath = `/Users/xqf/Desktop/${dataRegion}/user_concurrent_info.csv`;
  const concurrentDB = getManager().getRepository(NetlessConcurrent);
  await csvtojson().fromFile(csvFilePath).then(async source => {
    for (let i = 0; i < source.length; i ++) {
      const item = source[i];
      const appUUID = item['appId'];
      const maxConcurrentNumber = item['maxConcurrentNumber'];
      const taskType = item['taskType'];
      const teamUUID = item['teamUUID'];
      const concurrent = new NetlessConcurrent();
      concurrent.teamUUID = teamUUID;
      concurrent.appUUID = appUUID;
      concurrent.taskType = taskType;
      concurrent.maxConcurrentNumber = Number(maxConcurrentNumber);
      concurrent.dataRegion = dataRegion;
      try {
        await concurrentDB.save(concurrent);
      } catch (e) {
        console.log(e);
      }
    }
  });
}

async function importDataRegionDataAll(dataRegion: string) {
  await importServiceConfigAndStorage(dataRegion);
  await importConcurrent(dataRegion);
}

createConnection({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'dashboard',
  logger: 'simple-console',
  entities: [
    NetlessService,
    NetlessConcurrent,
    NetlessStorage
  ]
}).then(async connection => {
  console.log('Begin');
  await importDataRegionDataAll('us-sv');
  console.log('Done');
  exit();
});
