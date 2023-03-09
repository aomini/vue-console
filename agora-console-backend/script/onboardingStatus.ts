import { CompanyField } from '../models/company';
import { VendorInfo } from '../models/vendorInfo';
import { getManager, createConnection } from 'typeorm';
import { exit } from 'shelljs';

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
  const vendorInfoDB = getManager().getRepository(VendorInfo);
  const companyFieldDB = getManager().getRepository(CompanyField);
  const companys = await vendorInfoDB.createQueryBuilder('vendorInfo')
      .select('DISTINCT vendorInfo.companyId')
      .getRawMany();
  for (const company of companys) {
    const companyId = company.company_id;
    console.log(`company_id: ${companyId}`);
    if (!companyId) continue;
    const companyInfo = await CompanyField.findOne({ where: { companyId: companyId } });
    if (companyInfo) continue;
    const newField = new CompanyField();
    newField.companyId = companyId;
    newField.onboardingStatus = 1;
    newField.viewAAStatus = 1;
    await companyFieldDB.save(newField);
  }
  exit();
}).catch((e) => {
  console.log(e);
});
