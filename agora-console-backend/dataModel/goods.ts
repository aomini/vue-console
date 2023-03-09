export interface OrderModel {
  customUid: string;
  goodsId: string;
  currency: 'USD' | 'CNY';
  effectiveMonth: string;
  remarks: string;
  agent: string;
  withBill: WithBillItem;
}

export enum WithBillItem {
  WillBill = 1,
  NotBill = 0
}

export interface SubscriptionModel {
  customUid: string;
  goodsId: string;
  currency: 'USD' | 'CNY';
  subscriptionMonths: number;
  remarks: string;
  agent: string;
  withBill: WithBillItem;
}

export enum IsActive {
  Active = 1,
  InActive = 0
}

export enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Refunded = 'Refunded',
  Canceled = 'Canceled'
}

export enum PaymentMode {
  Standard= 'Standard',
  Immediately = 'Immediately'
}

export enum SubscriptionStatus {
  Pending = 'Pending',
  Active = 'Active',
  Expired = 'Expired',
  Canceled = 'Canceled'
}
