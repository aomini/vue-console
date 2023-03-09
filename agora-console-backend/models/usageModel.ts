import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usage_model')
export class UsageModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;
  @Column({ name: 'model_id' })
  modelId: number;
  @Column({ name: 'mode' })
  mode: number;
  @Column({ name: 'router' })
  router?: string;
  @Column({ name: 'name_cn' })
  nameCn: string;
  @Column({ name: 'name_en' })
  nameEn: string;
  @Column({ name: 'extension_id' })
  extensionId: string;
  @Column({ name: 'fetch_params' })
  fetchParams: string;
  @Column({ name: 'tip_cn' })
  tipCn: string;
  @Column({ name: 'tip_en' })
  tipEn: string;
  @Column({ name: 'status' })
  status: string;
  @Column({ name: 'setting_value' })
  settingValue: string;
  @Column({ name: 'render_params' })
  renderParams: string;
  @Column({ name: 'package_type' })
  packageType: string;
  @Column({ name: 'show_aggregate' })
  showAggregate: string;
  @Column({ name: 'weight' })
  weight: string;
}
