import { ReceiptSetting, Receipt, ReceiptBills } from '../models/receipt';
import { getManager } from 'typeorm';
import { generateUUID } from '../utils/encryptTool';
import * as moment from 'moment';
import { ListReply, ListParams } from '../models/listReply';

export const getReceiptSetting = async (companyId: number): Promise<ReceiptSetting> => {
  const setting = await ReceiptSetting.findOne({ where : { companyId: companyId } });
  return setting;
};

export const deleteSetting = async (companyId: number) => {
  const manager = getManager();
  await manager.transaction(async manager => {
    const settingDB = manager.getRepository(ReceiptSetting);
    await settingDB.createQueryBuilder()
      .delete()
      .from(ReceiptSetting)
      .where('company_id = :id', { id: companyId })
      .execute();
  });
};

export const setReceipPersontSetting = async (companyId: number, name: string, email: string, IdNumber: string): Promise<ReceiptSetting> => {
  let newSeeting = undefined;
  const settingDB = getManager().getRepository(ReceiptSetting);
  const settings = new ReceiptSetting();
  settings.companyId = companyId;
  const currentSetting = await settingDB.findOne(settings);
  if (currentSetting) {
    await deleteSetting(companyId);
  }
  settings.receiptType = 0;
  settings.name = name;
  settings.email = email;
  settings.idNumber = IdNumber;
  newSeeting = await settingDB.save(settings);
  return newSeeting;
};

export const setReceipEnterpriseSetting = async (receiptType: number, companyId: number, name: string, email: string, creditCode: string, address: string, phone: string, bankName: string, bankBranch: string, bankAccout: string, ccListStr: string = '', certificatePhoto: string = '', certificatePhotoKey: string = '', autoApply: number = 0, consignee: string = '', consigneePhone: string = '', consigneeAddress: string = ''): Promise<ReceiptSetting> => {
  let newSeeting = undefined;
  const settingDB = getManager().getRepository(ReceiptSetting);
  const settings = new ReceiptSetting();
  settings.companyId = companyId;
  const currentSetting = await settingDB.findOne(settings);
  if (currentSetting) {
    await deleteSetting(companyId);
  }
  settings.receiptType = receiptType;
  settings.name = name;
  settings.email = email;
  settings.creditCode = creditCode;
  settings.address = address;
  settings.phone = phone;
  settings.bankName = bankName;
  settings.bankBranch = bankBranch;
  settings.bankAccount = bankAccout;
  settings.ccListStr = ccListStr;
  settings.certificatePhoto = certificatePhoto;
  settings.certificatePhotoKey = certificatePhotoKey;
  settings.autoApply = autoApply;
  settings.consignee = consignee;
  settings.consigneePhone = consigneePhone;
  settings.consigneeAddress = consigneeAddress;
  newSeeting = await settingDB.save(settings);
  return newSeeting;
};

export const applyPersonReceipt = async (companyId: number, name: string, email: string, IdNumber: string, extra: string, amount: number, salesEmail: string): Promise<Receipt> => {
  const receiptDB = getManager().getRepository(Receipt);
  const receipt = new Receipt();
  receipt.id = generateUUID();
  receipt.companyId = companyId;
  receipt.receiptType = 0;
  receipt.status = 0;
  receipt.amount = amount;
  receipt.name = name;
  receipt.email = email;
  receipt.idNumber = IdNumber;
  receipt.extra = extra;
  receipt.amount = amount;
  receipt.salesEmail = salesEmail;
  receipt.appliedTime = moment().utc().unix();
  const newReceipt = await receiptDB.save(receipt);
  return newReceipt;
};

export const applyEnterpriseReceipt = async (companyId: number, name: string, email: string, creditCode: string, address: string, phone: string, bankName: string, bankBranch: string, bankAccout: string, extra: string, amount: number, salesEmail: string): Promise<Receipt> => {
  const receiptDB = getManager().getRepository(Receipt);
  const receipt = new Receipt();
  receipt.id = generateUUID();
  receipt.companyId = companyId;
  receipt.status = 0;
  receipt.receiptType = 1;
  receipt.amount = amount;
  receipt.name = name;
  receipt.email = email;
  receipt.creditCode = creditCode;
  receipt.address = address;
  receipt.phone = phone;
  receipt.bankName = bankName;
  receipt.openingBank = bankBranch;
  receipt.bankAccount = bankAccout;
  receipt.extra = extra;
  receipt.amount = amount;
  receipt.salesEmail = salesEmail;
  receipt.appliedTime = moment().utc().unix();
  const newReceipt = await receiptDB.save(receipt);
  return newReceipt;
};

export const applyEnterpriseSpecialReceipt = async (companyId: number, name: string, email: string, ccListStr: string, creditCode: string, address: string, phone: string, bankName: string, bankBranch: string, bankAccout: string, extra: string, amount: number, consignee: string, consigneePhone: string, consigneeAddress: string, salesEmail: string): Promise<Receipt> => {
  const receiptDB = getManager().getRepository(Receipt);
  const receipt = new Receipt();
  receipt.id = generateUUID();
  receipt.companyId = companyId;
  receipt.status = 0;
  receipt.receiptType = 2;
  receipt.amount = amount;
  receipt.name = name;
  receipt.email = email;
  receipt.creditCode = creditCode;
  receipt.address = address;
  receipt.phone = phone;
  receipt.bankName = bankName;
  receipt.openingBank = bankBranch;
  receipt.bankAccount = bankAccout;
  receipt.extra = extra;
  receipt.amount = amount;
  receipt.consignee = consignee;
  receipt.consigneePhone = consigneePhone;
  receipt.consigneeAddress = consigneeAddress;
  receipt.salesEmail = salesEmail;
  receipt.ccListStr = ccListStr;
  receipt.appliedTime = moment().utc().unix();
  const newReceipt = await receiptDB.save(receipt);
  return newReceipt;
};

export const recordBill = async (receiptId: string, billId: string): Promise<ReceiptBills> => {
  const receiptBill = new ReceiptBills();
  const receiptBillDB = getManager().getRepository(ReceiptBills);
  receiptBill.receiptId = receiptId;
  receiptBill.billId = billId;
  const result = await receiptBillDB.save(receiptBill);
  return result;
};

export const checkBill = async (billId: string): Promise<ReceiptBills> => {
  const receiptBillDB = getManager().getRepository(ReceiptBills);
  const receiptBill = await receiptBillDB.findOne({ where : { billId: billId } });
  return receiptBill;
};

export const getReceiptInfo = async (receiptId: string, companyId: number): Promise<Receipt> => {
  const receipt = await Receipt.findOne({ where : { id: receiptId, companyId: companyId } });
  return receipt;
};

export const getReceiptIdByBill = async (billId: string): Promise<ReceiptBills> => {
  const receiptBill = await ReceiptBills.findOne({ where : { billId: billId } });
  return receiptBill;
};

export const getReceiptList = async (params: ListParams): Promise<ListReply<any>> => {
  const listReply: ListReply<Receipt> = {
    total: 0,
    items: []
  };

  const receiptInfoDB = getManager().getRepository(Receipt);
  let receiptDBQuery = receiptInfoDB.createQueryBuilder('receipt')
    .where('(receipt.company_id = :companyId)', { companyId: params.params.companyId });
  const prop = 'receipt.applied_time';
  let order;
  order = 'DESC';

  receiptDBQuery = receiptDBQuery.addOrderBy(prop, order);
  if (!params.params.fetchAll) {
    receiptDBQuery = receiptDBQuery.offset(params.skip).limit(params.limit);
  }

  const [items, total] = await receiptDBQuery.getManyAndCount();

  listReply.total = total;
  listReply.items = items;
  return listReply;
};
