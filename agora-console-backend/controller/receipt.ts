import * as Koa from 'koa';
import { ErrCode } from './apiCodes';
import { Params, ListParams } from '../models/listReply';
import * as ReceiptService from '../services/receipt';
import * as FinanceService from '../externalService/finance';
import { getVisitUrl } from './identity';

export const getReceiptSetting = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  try {
    const setting = await ReceiptService.getReceiptSetting(companyId);
    if (setting && setting['certificatePhotoKey']) {
      setting['certificatePhotoUrl'] = await getVisitUrl(setting['certificatePhotoKey']);
    }
    ctx.status = 200;
    ctx.body = setting;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_RECEIPT_SETTING };
  }
};

export const getReceiptInfo = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { receiptId } = ctx.query;
  try {
    const receiptInfo = await ReceiptService.getReceiptInfo(receiptId, companyId);
    ctx.status = 200;
    ctx.body = receiptInfo;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_RECEIPT_INFO };
  }
};

export const getReceiptList = async (ctx: Koa.Context) => {
  const { limit, page } = ctx.request.query;
  const companyId = ctx.session.companyId;
  const listParams = new ListParams(limit, page, { companyId });
  try {
    const receipts = await ReceiptService.getReceiptList(listParams);
    ctx.status = 200;
    ctx.body = receipts;
  } catch (e) {
    ctx.status = 500;
    ctx.logger.error(e.message);
    ctx.body = { code: ErrCode.FAILED_GET_RECEIPT_INFO };
  }
};

export const setPersonSetting = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { name, email, IdNumber } = ctx.request.body;
  try {
    const setting = await ReceiptService.setReceipPersontSetting(companyId, name, email, IdNumber);
    ctx.status = 200;
    ctx.body = setting;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_SET_RECEIPT_SETTING };
    ctx.logger.error(e);
  }
};

export const setEnterpriseSetting = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { receiptType, name, email, credit_code, address, phone, bank_name, bank_branch, bank_account, ccListStr, certificatePhoto, certificatePhotoKey, autoApply, consignee, consigneePhone, consigneeAddress } = ctx.request.body;
  try {
    const setting = await ReceiptService.setReceipEnterpriseSetting(receiptType, companyId, name, email, credit_code, address, phone, bank_name, bank_branch, bank_account, ccListStr, certificatePhoto, certificatePhotoKey, autoApply, consignee, consigneePhone, consigneeAddress);
    ctx.status = 200;
    ctx.body = setting;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_SET_RECEIPT_SETTING };
    ctx.logger.error(e);
  }
};

export const applyReceipt = async (ctx: Koa.Context) => {
  const companyId = ctx.session.companyId;
  const { bill_ids, extra, settings, amount, sales_email, once_bill_ids } = ctx.request.body;
  let applyReceipt = undefined;
  try {
    const params = new Params({ bill_ids, status: 1 });
    const params_once_bill = new Params({ once_bill_ids, status: 1 });
    const apply = bill_ids.length > 0 && await FinanceService.putInvoiceStatus(ctx.logger, params);
    const apply_once_bill = once_bill_ids.length > 0 && await FinanceService.putOnceBillInvoiceStatus(ctx.logger, params_once_bill);
    const all_bill_ids = bill_ids.concat(once_bill_ids);
    if (!apply && !apply_once_bill) {
      if (settings.receiptType === 0) {
        applyReceipt = await ReceiptService.applyPersonReceipt(companyId, settings.name, settings.email, settings.idNumber, extra, amount, sales_email);
        for (const bill of all_bill_ids) {
          await ReceiptService.recordBill(applyReceipt.id, bill);
        }
      }
      if (settings.receiptType === 1) {
        applyReceipt = await ReceiptService.applyEnterpriseReceipt(companyId, settings.name, settings.email, settings.creditCode, settings.address, settings.phone, settings.bankName, settings.bankBranch, settings.bankAccount, extra, amount, sales_email);
        for (const bill of all_bill_ids) {
          await ReceiptService.recordBill(applyReceipt.id, bill);
        }
      }
      if (settings.receiptType === 2) {
        applyReceipt = await ReceiptService.applyEnterpriseSpecialReceipt(companyId, settings.name, settings.email, settings.ccListStr, settings.creditCode, settings.address, settings.phone, settings.bankName, settings.bankBranch, settings.bankAccount, extra, amount, settings.consignee, settings.consigneePhone, settings.consigneeAddress, sales_email);
        for (const bill of all_bill_ids) {
          await ReceiptService.recordBill(applyReceipt.id, bill);
        }
      }
    }
    ctx.status = 200;
    ctx.body = applyReceipt;
  } catch (e) {
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_SET_RECEIPT_SETTING };
    ctx.logger.error(e);
  }
};
