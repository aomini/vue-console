import * as assert from 'assert';
import 'mocha';
import { getConnection } from "typeorm";
import * as ReceiptService from './receipt';
import { ReceiptSetting } from '../models/receipt';
import { ListParams } from '../models/listReply';

let testpersonCompanyId = 1;
let testEnterpriseCompanyId = 2;

describe('receipt-service', () => {
  before(async()=>{
    let personSettings = new ReceiptSetting();
    personSettings.companyId = testpersonCompanyId;
    personSettings.receiptType = 0;
    personSettings.name = 'test';
    personSettings.email = 'test';
    personSettings.idNumber = 'test';
    await ReceiptSetting.save(personSettings);
    let enterpriseSettings = new ReceiptSetting();
    enterpriseSettings.companyId = testEnterpriseCompanyId;
    enterpriseSettings.receiptType = 1;
    enterpriseSettings.name = 'test';
    enterpriseSettings.email = 'test';
    enterpriseSettings.creditCode = 'test';
    enterpriseSettings.address = 'test addr';
    enterpriseSettings.phone = 'test phone';
    enterpriseSettings.bankName = 'test bank';
    enterpriseSettings.bankBranch = 'test branch';
    enterpriseSettings.bankAccount = 'test account';
    await ReceiptSetting.save(enterpriseSettings);
  });
  describe('get receipt setting', () => {
    it('get person setting', async () => {
      const setting = await ReceiptService.getReceiptSetting(testpersonCompanyId);
      assert.notEqual(setting, undefined);
      assert.notEqual(setting.name, undefined);
      const setting1 = await ReceiptService.getReceiptSetting(-1);
      assert.equal(setting1, undefined);
    });
    it('get enterprise setting', async () => {
      const setting = await ReceiptService.getReceiptSetting(testEnterpriseCompanyId);
      assert.notEqual(setting, undefined);
      assert.notEqual(setting.creditCode, undefined);
      const setting1 = await ReceiptService.getReceiptSetting(-1);
      assert.equal(setting1, undefined);
    })
  });
  describe('create receipt', () => {
    it('create a new person receipt', async () => {
      const receipt = await ReceiptService.applyPersonReceipt(testpersonCompanyId, 'test', 'test', 'test', 'test', 1, 'test');
      const receiptBill = await ReceiptService.recordBill(receipt.id, 'testBillId')
      assert.notEqual(receipt.id, undefined);
      assert.equal(receipt.receiptType, 0);
      assert.notEqual(receiptBill.receiptId, undefined);
    });
    it('create a new enterprise receipt', async () => {
      const receipt = await ReceiptService.applyEnterpriseReceipt(testEnterpriseCompanyId, 'test', 'test', 'test', 'test', 'test', 'test', 'test', 'test', 'test', 1, 'test');
      const receiptBill = await ReceiptService.recordBill(receipt.id, 'testBillId1')
      assert.notEqual(receipt.id, undefined)
      assert.notEqual(receiptBill.receiptId, undefined);
      assert.equal(receipt.receiptType, 1);
    });
    it('create a new enterprise special receipt', async () => {
      const receipt = await ReceiptService.applyEnterpriseSpecialReceipt(testEnterpriseCompanyId, 'test', 'test', 'test', 'test', 'test', 'test', 'test', 'test', 'test', 1, 'test', 'test', 'test', 'test');
      const receiptBill = await ReceiptService.recordBill(receipt.id, 'testBillId2')
      assert.notEqual(receipt.id, undefined)
      assert.notEqual(receiptBill.receiptId, undefined);
      assert.equal(receipt.receiptType, 2);
    })
  });
  describe('receipt-list', () => {
    it('', async () => {
      const params = new ListParams(0, 0);
      const ret = await ReceiptService.getReceiptList(params);
      assert.equal(ret.total, 0);
    });
    it('status filter', async () => {
      const params = new ListParams(1, 10, { companyId: testpersonCompanyId })
      const ret = await ReceiptService.getReceiptList(params);
      assert.equal(ret.total, 1);
    })
  });
  describe('update-setting', () => {
    it('update an existing setting', async () => {
      const ret = await ReceiptService.setReceipPersontSetting(testpersonCompanyId, 'update', 'update', 'update');
      assert.equal(ret.name, 'update')
    })
  })
});
