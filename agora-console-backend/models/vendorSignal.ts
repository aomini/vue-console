import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

export const needToken = 1;
export const notNeedToken = 0;

@Entity()
export class VendorSignal extends BaseEntity {
  @PrimaryColumn({ name: 'vendor_id' })
  id: number;

  @Column({ name: 'app_id' })
  appId: string;

  @Column({ name: 'need_token' })
  needToken: number;
}
