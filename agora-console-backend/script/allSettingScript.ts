import { VendorUsage } from '../models/vendorUsage';
import { getManager, createConnection } from 'typeorm';
import { ProjectSettings } from '../models/usageSettings';
import { Company } from '../models/company';

const tplToSetting = {
  'a1': [1],
  'a2': [2, 7],
  'a3': [5],
  'a4': [1, 2, 3],
  'b1': [11],
  'b2': [8],
  'b3': [10],
  'b4': [9],
  'c1': [12],
  'c2': [13],
  'd1': [14],
  'd2': [15]
};

createConnection({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'vendors',
  logger: 'simple-console',
  entities: ['../models/*{.ts,.js}']
}).then(async connection => {
  const usageSettings = await VendorUsage.find();
  for (const setting of usageSettings) {
    if (!setting.companyId || !setting.liveTpl) {
      continue;
    } else {
      const companyDB = getManager().getRepository(Company);
      const companyQuery = companyDB.createQueryBuilder('company')
          .where(`company.id = ${setting.companyId}`);
      const company = await companyQuery.getOne();
      if (!company) {
        console.log('Company does not exist', setting);
        continue;
      }

      let projectId = undefined;
      if (Number(setting.vendorId) > 1500000000 || Number(setting.vendorId) === 1500000000) {
        projectId = '0';
      } else {
        continue;
      }
      const tplArray = setting.liveTpl.split(',');

      for (const tplItem of tplArray) {
        const settingId = tplToSetting[tplItem].slice();
        if (company.country === 'CN') {
          // 中国账户SD分开展示
          if (tplItem === 'a1' || tplItem === 'a2' || tplItem === 'a4') {
            settingId.push(4);
          }
          if (tplItem === 'd1') {
            settingId.push(16);
          }
        }
        for (const id of settingId) {
          const projectSetting = new ProjectSettings();
          projectSetting.projectId = projectId;
          projectSetting.companyId = Number(setting.companyId);
          projectSetting.setting = id;
          await projectSetting.save();
          console.log('setting is saved successfully', setting, projectSetting);
        }
      }
    }
  }
}).catch(() => {
  console.log('error');
});
