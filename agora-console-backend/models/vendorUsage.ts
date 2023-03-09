import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity()
export class VendorUsage extends BaseEntity {
  @PrimaryColumn({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'company_id' })
  companyId: String;

  @Column({ name: 'live_tpl' })
  liveTpl: String;
}
