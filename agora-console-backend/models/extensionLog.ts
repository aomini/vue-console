import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('extension_log')
export class ExtensionLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;
  @Column({ name: 'company_id' })
  companyId: number;
  @Column({ name: 'vendor_id' })
  vendorId: number;
  @Column({ name: 'product' })
  product: string;
  @Column({ name: 'extension' })
  extension: string;
  @Column({ name: 'result' })
  result: number;
  @Column({ name: 'event' })
  event: string;
  @Column({ name: 'payload' })
  payload: string;
  @Column({ name: 'create_time' })
  createTime: string;
}
