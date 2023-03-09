import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class ReceiptSetting extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'company_id' })
    companyId: number;

  @Column({ name: 'receipt_type' })
    receiptType: number;

  @Column()
    name: string;

  @Column()
    email: string;

  @Column({ name: 'cc_list_str' })
  ccListStr: string;

  @Column({ name: 'id_number' })
    idNumber: string;

  @Column({ name: 'credit_code' })
    creditCode: string;

  @Column()
    address: string;

  @Column()
    phone: string;

  @Column({ name: 'bank_name' })
    bankName: string;

  @Column({ name: 'bank_branch' })
    bankBranch: string;

  @Column({ name: 'bank_account' })
    bankAccount: string;

  @Column()
    consignee: string;

  @Column({ name: 'consignee_phone' })
    consigneePhone: string;

  @Column({ name: 'consignee_address' })
    consigneeAddress: string;

  @Column({ name: 'certificate_photo' })
    certificatePhoto: string;

  @Column({ name: 'certificate_photo_key' })
    certificatePhotoKey: string;

  @Column({ name: 'auto_apply' })
    autoApply: number;
}

@Entity()
export class Receipt extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: string;

  @Column({ name: 'company_id' })
    companyId: number;

  @Column()
    status: number;

  @Column()
    amount: number;

  @Column()
    name: string;

  @Column({ name: 'receipt_type' })
    receiptType: number;

  @Column({ name: 'id_number' })
    idNumber: string;

  @Column({ name: 'credit_code' })
    creditCode: string;

  @Column()
    email: string;

  @Column({ name: 'cc_list_str' })
    ccListStr: string;

  @Column()
    address: string;

  @Column()
    phone: string;

  @Column({ name: 'bank_name' })
    bankName: string;

  @Column({ name: 'bank_branch' })
    openingBank: string;

  @Column({ name: 'bank_account' })
    bankAccount: string;

  @Column()
    consignee: string;

  @Column({ name: 'consignee_phone' })
    consigneePhone: string;

  @Column({ name: 'consignee_address' })
    consigneeAddress: string;

  @Column()
    extra: string;

  @Column({ name: 'sales_email' })
    salesEmail: string;

  @Column({ name: 'applied_time' })
    appliedTime: number;

  @Column({ name: 'reject_reason' })
    rejectReason: number;

  @Column({ name: 'tracking_number' })
  trackingNumber: string;
}

@Entity()
export class ReceiptBills extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'bill_id' })
    billId: string;

  @Column({ name: 'receipt_id' })
    receiptId: string;
}
