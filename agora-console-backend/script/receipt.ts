import { getManager, createConnection } from 'typeorm';
import { ReceiptSetting } from '../models/receipt';
import { CompanyAuthentication, CompanyIdentity } from '../models/identity';
import { exit } from 'shelljs';
import * as fs from 'fs';
import * as moment from 'moment';

const test = fs.readFileSync('/Users/xqf/Desktop/实名认证.csv', { encoding: 'utf-8' }).replace(/\r\n/g, '\n');
const rows = test.split('\n');

createConnection({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'vendors',
  logger: 'simple-console',
  entities: [
    ReceiptSetting,
    CompanyIdentity,
    CompanyAuthentication
  ]
}).then(async connection => {
  for (const line of rows) {
    if (!line) {
      break;
    }
    const item = line.split(',');
    const companyId = item[0];
    const companyName = item[1];
    const creditCode = item[2];
    const reg = /行[1-9]\d/;
    const item3 = item[3].replace(/^\s+|\s+$/g, '');
    const item4 = item[4].replace(/^\s+|\s+$/g, '');
    const tmp = item3.match(reg);
    let bankName = '';
    let account = '';
    console.log(`row begin, company_id: ${companyId}`);
    if (tmp) {
      const index = tmp['index'];
      bankName = item3.slice(0, index + 1);
      account = item3.slice(index + 1);
    }
    const address = item4.split(' ')[0];
    const phone = item4.split(' ')[1];
    const consignee = item[6];
    const consigneePhone = item[7];
    const consigneeAddress = item[8];
    const identityDB = getManager().getRepository(CompanyIdentity);
    const authDB = getManager().getRepository(CompanyAuthentication);
    const settingDB = getManager().getRepository(ReceiptSetting);
    const authtication = new CompanyAuthentication();
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    authtication.companyId = Number(companyId);
    authtication.identityType = 0;
    authtication.status = 0;
    await authDB.save(authtication);
    const identity = new CompanyIdentity();
    identity.companyId = Number(companyId);
    identity.name = companyName;
    identity.creditCode = creditCode;
    identity.address = address;
    identity.phone = phone;
    identity.status = 0;
    identity.submitTime = timestamp;
    await identityDB.save(identity);

    // 发票设置
    const settings = new ReceiptSetting();
    settings.companyId = Number(companyId);
    settings.receiptType = 2;
    settings.name = companyName;
    settings.creditCode = creditCode;
    settings.address = address;
    settings.phone = phone;
    settings.bankName = bankName;
    settings.bankBranch = '';
    settings.bankAccount = account;
    settings.consignee = consignee;
    settings.consigneeAddress = consigneeAddress;
    settings.consigneePhone = consigneePhone;
    settings.autoApply = 1;
    await settingDB.save(settings);
  }
  console.log('Done');
  exit();
}).catch(e => {
  console.log(e);
});
