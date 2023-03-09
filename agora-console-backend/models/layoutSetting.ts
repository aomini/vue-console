import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'layout_setting' })
export class LayoutSetting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column()
  setting: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
