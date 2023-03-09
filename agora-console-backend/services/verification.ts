// import { getManager } from 'typeorm';
import * as moment from 'moment';
import { AccountVerification } from '../models/accountVerification';

export const VERIFICATION_STATUS = {
  IN_USE: 1,
  USED: 2,
  EXPIRED: 3
};

export const VERIFICATION_TYPE = {
  PHONE: 1,
  EMAIL: 2
};

export const MAX_ATTEMPT_COUNT = 3;

export const findCurrentVerification = async (accountId: number, companyId: number, type: number) => {
  const currentVerification = await AccountVerification.findOne({ where: { accountId, companyId, status: VERIFICATION_STATUS.IN_USE, type } });
  return currentVerification;
};

export const generateEmailVerification = async (accountId: number, companyId: number, verificationCode: string) => {
  await AccountVerification.update({ accountId, companyId, type: VERIFICATION_TYPE.EMAIL }, { status: VERIFICATION_STATUS.EXPIRED });
  await AccountVerification.insert({
    accountId,
    companyId,
    verificationCode,
    status: VERIFICATION_STATUS.IN_USE,
    triedCount: 0,
    expiredAt: moment().add(10, 'minute').toDate(),
    type: VERIFICATION_TYPE.EMAIL
  });
};

export const generatePhoneVerification = async (accountId: number, companyId: number, verificationCode: string) => {
  await AccountVerification.update({ accountId, companyId, type: VERIFICATION_TYPE.PHONE }, { status: VERIFICATION_STATUS.EXPIRED });
  await AccountVerification.insert({
    accountId,
    companyId,
    verificationCode,
    status: VERIFICATION_STATUS.IN_USE,
    triedCount: 0,
    expiredAt: moment().add(10, 'minute').toDate(),
    type: VERIFICATION_TYPE.PHONE
  });
};

export const setCurrentAttemptAsFail = async (verification: AccountVerification) => {
  verification.triedCount = verification.triedCount + 1;
  if (verification.triedCount >= MAX_ATTEMPT_COUNT) {
    verification.status = VERIFICATION_STATUS.EXPIRED;
  }
  await verification.save();
};

export const setCurrentAttemptAsSuccess = async (verification: AccountVerification) => {
  verification.triedCount = verification.triedCount + 1;
  verification.status = VERIFICATION_STATUS.USED;
  await verification.save();
};
