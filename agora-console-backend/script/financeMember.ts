// tslint:disable-next-line:no-require-imports
const xlsx = require('node-xlsx');
import * as MemberService from '../services/member';
import * as AccountService from '../services/account';
import * as PermissionService from '../services/permission';
import { createConnection } from 'typeorm';
import { exit } from 'shelljs';

const ws = xlsx.parse('./billing_email.xlsx');

const items = ws[0].data.splice(1, ws[0].data.length);
let count = 0;
createConnection({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'dashboard',
  logger: 'simple-console',
  entities: ['../models/*{.ts,.js}']
}).then(async connection => {
  for (const item of items) {
    count += 1;
    console.log(`count: ${count}`);
    console.log(item);
    const companyId = item[0];
    const email = item[1];
    const roleId = 5;
    const language = 'chinese';
    try {
      const exist = await MemberService.getMemberByEmail(email, companyId);
      if (exist) {
        console.log('member email exist');
        continue;
      }
      const checkAccountEmail = await MemberService.checkAccountEmail(email);
      if (!checkAccountEmail) {
        console.log('account email exist');
        continue;
      }
      const checkMemberEmail = await MemberService.checkAccountMemberEmail(email, companyId);
      if (!checkMemberEmail) {
        console.log('MEMBER_EMAIL_EXIST');
        continue;
      }
      const checkRole = await PermissionService.getRoleById(roleId, companyId);
      if (!checkRole) {
        console.log('role_not_EXIST');
        continue;
      }
      const reply = await MemberService.createOrUpdateMember(email, roleId, language, companyId);
      console.log('insert success');
      if (reply) {
        await AccountService.setMemberEmailStatus(reply.id);
      }
    } catch (e) {
      console.log(e);
    }
  }
  console.log('Done');
  exit();
}).catch((e) => {
  console.log(e);
});
