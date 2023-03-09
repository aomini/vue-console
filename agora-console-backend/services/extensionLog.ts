import { ExtensionLog } from '../models/extensionLog';

export enum ExtensionEvents {
  Enable = 'enable',
  Config = 'config',
  Disable = 'disable',
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe'
}

export enum ProductLogEnum {
  RTC = 'RTC',
  Whiteboard = 'Whiteboard',
  APaaS = 'APaaS',
  CDN = 'CDN',
  FPA = 'FPA',
  Chat = 'Chat'
}

export interface ExtensionLogParams {
  companyId: number;
  vendorId: number;
  product: ProductLogEnum;
  extension: string;
  result: number;
  event: ExtensionEvents;
  payload?: string;
}

export const generateExtensionLog = async (params: ExtensionLogParams) => {
  const result = params.result === 200 ? 1 : 0;
  await ExtensionLog.insert({
    companyId: params.companyId,
    vendorId: params.vendorId,
    product: params.product,
    extension: params.extension,
    result: result,
    event: params.event,
    payload: params.payload
  });
};
