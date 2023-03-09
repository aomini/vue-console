import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usage_resolution')
export class UsageResolution extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;
  @Column({ name: 'resolution_id' })
  resolutionId: string;
  @Column({ name: 'name_cn' })
  nameCn: string;
  @Column({ name: 'name_en' })
  nameEn: string;
  @Column({ name: 'icon' })
  icon: string;
  @Column({ name: 'unit_cn' })
  unitCn: string;
  @Column({ name: 'unit_en' })
  unitEn: string;
}
