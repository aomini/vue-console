import * as Koa from 'koa';
import { ErrCode } from '../controller/apiCodes';
import * as ReceiptService from '../services/receipt';

export const applyReceipt = async (ctx: Koa.Context) => {
  const { companyId } = ctx.request.query;
  const { billingRecordIdSet, extra, amount, salesEmail } = ctx.request.body;
  if (!billingRecordIdSet || !amount || !companyId) {
    ctx.status = 400;
    ctx.body = { message: 'miss params' };
    return;
  }
  let applyReceipt = undefined;
  const billPeriod = extra.join('，');
  try {
    const settings = await ReceiptService.getReceiptSetting(companyId);
    if (!settings || settings.autoApply !== 1) {
      ctx.status = 400;
      ctx.body = { code: ErrCode.RECEIPT_SETTING_NOT_MATCH, errorMessage: 'receipt setting not match' };
      return;
    }
    for (const bill of billingRecordIdSet) {
      const checkBill = await ReceiptService.checkBill(bill);
      if (checkBill) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.RECEIPT_ALLREADY_EXIST, errorMessage: 'receipt already exist' };
        return;
      }
    }
    if (settings.receiptType === 2) {
      if (!settings.name || !settings.creditCode || !settings.consignee || !settings.consigneePhone || !settings.consigneeAddress) {
        ctx.status = 400;
        ctx.body = { code: ErrCode.RECEIPT_SETTING_NOT_MATCH, errorMessage: 'miss some receipt setting' };
        return;
      }
      applyReceipt = await ReceiptService.applyEnterpriseSpecialReceipt(companyId, settings.name, settings.email, settings.ccListStr, settings.creditCode, settings.address, settings.phone, settings.bankName, settings.bankBranch, settings.bankAccount, billPeriod, amount, settings.consignee, settings.consigneePhone, settings.consigneeAddress, salesEmail);
    }
    if (settings.receiptType === 0) {
      applyReceipt = await ReceiptService.applyPersonReceipt(companyId, settings.name, settings.email, settings.idNumber, billPeriod, amount, salesEmail);
    }
    if (settings.receiptType === 1) {
      applyReceipt = await ReceiptService.applyEnterpriseReceipt(companyId, settings.name, settings.email, settings.creditCode, settings.address, settings.phone, settings.bankName, settings.bankBranch, settings.bankAccount, billPeriod, amount, salesEmail);
    }
    for (const bill of billingRecordIdSet) {
      if (applyReceipt && applyReceipt.id) {
        await ReceiptService.recordBill(applyReceipt.id, bill);
      }
    }
    ctx.status = 200;
    ctx.body = applyReceipt;
  } catch (e) {
    let errorMessage = 'fail to set receipt info';
    if (e.response && e.response.data && e.response.data.errorMessage) {
      errorMessage = e.response.data.errorMessage;
    }
    ctx.status = 500;
    ctx.body = { code: ErrCode.FAILED_SET_RECEIPT_INFO, errorMessage: errorMessage };
    ctx.logger.error(e);
  }
};
