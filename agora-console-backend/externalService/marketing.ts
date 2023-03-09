import { Logger as LoggerNew } from '../logging';
import { Logger } from 'log4js';

import * as CompanyService from '../services/company';
import * as UserProfileService from '../services/account';
import { Company, AREA_CN } from '../models/company';

import * as MarketoService from './marketo';
import * as SalesforceService from './salesforce';
import * as EloquaService from './eloquaService';
import { User, UserProfile } from '../models/user';

import { getCardList } from './finance';

import { industry, environment, interest } from '../utils/preference';

const setUtmInfo = (info: any, utmstr: string) => {
  let utm;
  try {
    utm = JSON.parse(utmstr);
  } catch (err) {
    utm = {};
    console.error('utm_info parse error:', err);
  }
  if (!utm) return;
  if (utm.utm_source) {
    info.utm_source__c = utm.utm_source;
  }
  if (utm.utm_medium) {
    info.utm_medium__c = utm.utm_medium;
  }
  if (utm.utm_campaign) {
    info.utm_campaign__c = utm.utm_campaign;
  }
  if (utm.utm_keyword) {
    info.utm_keyword__c = utm.utm_keyword;
  }
  if (utm.utm_device) {
    info.utm_device__c = utm.utm_device;
  }
};

const setEloquaUtmInfo = (info: any, utmstr: string) => {
  let utm;
  try {
    utm = JSON.parse(utmstr);
  } catch (err) {
    utm = {};
    console.error('utm_info parse error:', err);
  }
  if (!utm) return;
  if (utm.utm_source) {
    info.C_utm_source1 = utm.utm_source;
  }
  if (utm.utm_medium) {
    info.C_utm_medium1 = utm.utm_medium;
  }
  if (utm.utm_campaign) {
    info.C_utm_campaign1 = utm.utm_campaign;
  }
  if (utm.utm_keyword) {
    info.C_utm_keyword1 = utm.utm_keyword;
  }
  if (utm.utm_device) {
    info.C_utm_device1 = utm.utm_device;
  }
};

const createMarketoLead = async (log: Logger, company: Company, userProfile: any, others?: { [key: string]: object }) => {
  const lead: MarketoService.MarketoLead = {
    email: userProfile.email,
    industry: industry[company.industry],
    Company_ID__c: company.id,
    mktoAcquisitionDate: new Date(parseInt(userProfile.created, 10)),
    lastName: userProfile.lastName ? userProfile.lastName : 'null',
    firstName: userProfile.firstName,
    country: company.country,
    company: company.name || userProfile.email,
    Tech_Platform__c: environment[company.environment] || 'Other',
    Product_Interest__c: interest[company.interest] || 'Other',
    phone: userProfile.verifyPhone,
    Verified_Mobile_Number__c: userProfile.verifyPhone
  };
  try {
    const ret = await getCardList(log, company.id);
    let defaultlast4;
    for (const item of ret.data) {
      if (item.defaultCard) defaultlast4 = item.cardLast4;
    }
    if (defaultlast4) {
      lead.Credit_Card__c = defaultlast4;
    }
    const registerInfo = await UserProfileService.getAccountRegistry(userProfile.accountId);
    if (registerInfo) {
      setUtmInfo(lead, registerInfo.utmInfo);
      const originTags = [ 'reg', userProfile.language ];
      if (registerInfo.regSource) {
        originTags.push(registerInfo.regSource);
      }
      lead.MQL_Source__c = originTags;
    }
  } catch (e) {
    log.error(e);
  }
  if (userProfile.verifyDate) {
    lead.Verified_Mobile_Date__c = userProfile.verifyDate;
  }
  await MarketoService.createLead(log, lead);
};

export const createSalesforceLead = async (log: Logger, company: Company, userProfile: any) => {
  const lead: SalesforceService.SalesforceLead = {
    Email: userProfile.email,
    mkto71_Acquisition_Date__c: new Date(parseInt(userProfile.created, 10)).toISOString(),
    Company_ID__c: company.id,
    LastName: userProfile.lastName ? userProfile.lastName : 'null',
    FirstName: userProfile.firstName,
    Origin__c: company.country,
    Company: company.name || userProfile.email,
    Phone: userProfile.verifyPhone,
    Industry: industry[company.industry] || 'Other',
    Tech_Platform__c: environment[company.environment] || 'Other',
    Product_Interest__c: interest[company.interest] || 'Other',
    Verified_mobile_number__c: userProfile.verifyPhone
  };
  if (userProfile.verifyDate) {
    lead.Verified_mobile_date__c = userProfile.verifyDate.toISOString();
  }
  const registerInfo = await UserProfileService.getAccountRegistry(userProfile.accountId);
  if (registerInfo) {
    setUtmInfo(lead, registerInfo.utmInfo);
    const originTags = [ 'reg', userProfile.language ];
    if (registerInfo.regSource) {
      originTags.push(registerInfo.regSource);
    }
    lead.CN_Lead_Source_Type__c = originTags;
  }
  // console.log(lead);
  await SalesforceService.createLead(log, lead);
};

export const createEloquaContact = async (log: Logger, company: Company, userProfile: any) => {
  const contact: EloquaService.EloquaContact = {
    C_EmailAddress: `${company.id}@agora.io`,
    C_Company: company.name || userProfile.email,
    C_Company_ID1: company.id,
    C_Acquisition_Date1: new Date(parseInt(userProfile.created, 10)),
    C_Origin1: company.country,
    C_MobilePhone: userProfile.verifyPhone,
    C_Verified_Mobile_Date1: userProfile.verifyDate,
    C_Verified_Mobile_Number1: userProfile.verifyPhone,
    C_FirstName: userProfile.firstName || 'null',
    C_LastName: userProfile.lastName || 'null',
    C_Tech_Platform1: environment[company.environment] || 'Other',
    C_Product_Interest1: interest[company.interest] || 'Other',
    C_effective_email1: userProfile.email || `${company.id}@agora.io`
  };
  const registerInfo = await UserProfileService.getAccountRegistry(userProfile.accountId);
  if (registerInfo) {
    setEloquaUtmInfo(contact, registerInfo.utmInfo);
    const originTags = [ 'reg', userProfile.language ];
    if (registerInfo.regSource) {
      originTags.push(registerInfo.regSource);
    }
    contact.C_MQL_Source1 = originTags.toString();
  }
  await EloquaService.createContact(log, contact);
};

export const updatePhone = async (companyId: number) => {
  const log = LoggerNew();
  const company: Company = await CompanyService.getCompanyById(companyId);
  if (!company) return;
  const userProfile: any = await UserProfileService.getUserProfileByCompanyId(companyId);
  if (!userProfile) return;
  if (company.area === AREA_CN) {
    const eloquaContact = await EloquaService.getContactsByCompanyId(log, companyId);
    if (!eloquaContact) {
      // await createEloquaContact(log, company, userProfile as UserProfile);
    } else {
      await EloquaService.updateAttrByContactId(log, eloquaContact.id, {
        C_Verified_Mobile_Date1: userProfile.verifyDate,
        C_Verified_Mobile_Number1: userProfile.verifyPhone,
        C_EmailAddress: eloquaContact.emailAddress || `${companyId}@agora.io`
      });
    }
  } else {
    const lead = await MarketoService.getLead(log, userProfile.email);
    if (!lead) {
      await createMarketoLead(log, company, userProfile as UserProfile);
    } else {
      await MarketoService.updateLead(log, lead.id, {
        Verified_mobile_number__c: userProfile.verifyPhone,
        Verified_mobile_date__c: (userProfile as UserProfile).verifyDate
      });
    }
  }
};

export const updateEmail = async (originEmail: string, companyId: number) => {
  const log = LoggerNew();
  const company: Company = await CompanyService.getCompanyById(companyId);
  if (!company) return;
  const userProfile: User = await UserProfileService.getUserProfileByCompanyId(companyId);
  if (!userProfile) return;
  if (company.area === AREA_CN) {
    const eloquaContact = await EloquaService.getContactsByCompanyId(log, companyId);
    if (!eloquaContact) {
      // await createEloquaContact(log, company, userProfile as UserProfile);
    } else {
      await EloquaService.updateAttrByContactId(log, eloquaContact.id, {
        C_EmailAddress: eloquaContact.emailAddress || `${companyId}@agora.io`,
        C_effective_email1: userProfile.email
      });
    }
  } else {
    const lead = await MarketoService.getLead(log, originEmail);
    if (!lead) {
      await createMarketoLead(log, company, userProfile as UserProfile);
    } else {
      await MarketoService.updateLead(log, lead.id, {
        email: userProfile.email
      });
    }
  }
};

export const updateCreditCard = async (companyId: number) => {
  const log = LoggerNew();
  const company: Company = await CompanyService.getCompanyById(companyId);
  if (!company) return;
  const userProfile: User = await UserProfileService.getUserProfileByCompanyId(companyId);
  if (!userProfile) return;
  const ret = await getCardList(log, companyId);
  let defaultlast4;
  for (const item of ret.data) {
    if (item.defaultCard) defaultlast4 = item.cardLast4;
  }
  if (company.area !== AREA_CN) {
    const lead = await MarketoService.getLead(log, userProfile.email);
    if (!lead) {
      await createMarketoLead(log, company, userProfile as UserProfile);
    } else {
      await MarketoService.updateLead(log, lead.id, {
        Credit_Card__c: defaultlast4
      });
    }
  }
};

export const updateAttr = async (companyId: number, attrs: { [key: string]: Object }) => {
  const log = LoggerNew();
  const company: Company = await CompanyService.getCompanyById(companyId);
  if (!company) return;
  const userProfile: User = await UserProfileService.getUserProfileByCompanyId(companyId);
  if (!userProfile) return;
  if (company.area !== AREA_CN) {
    log.info(`company[${companyId}]: not in CN, sync to marketo`);
    try {
      const lead = await MarketoService.getLead(log, userProfile.email);
      if (!lead) {
        await createMarketoLead(log, company, userProfile);
      } else {
        await MarketoService.updateLead(log, lead.id, attrs);
      }
    } catch (e) {
      log.error(`company[${companyId}] sync to marketo error: ${e.message}`);
    }
    return;
  }
  log.info(`company[${companyId}]: in CN, sync to eloqua`);
  try {
    const eloquaContact = await EloquaService.getContactsByCompanyId(log, companyId);
    if (!eloquaContact) {
      // await createEloquaContact(log, company, userProfile as UserProfile);
    } else {
      attrs.C_EmailAddress = eloquaContact.emailAddress || `${companyId}@agora.io`;
      await EloquaService.updateAttrByContactId(log, eloquaContact.id, attrs);
    }
  } catch (e) {
    log.error(e);
    log.error(`company[${companyId}] sync to eloqua error: ${e.message}`);
  }
};
