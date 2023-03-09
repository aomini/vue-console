import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('extension_type')
export class ProjectExtensionType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'extension_type_id' })
  extensionTypeId: string;
  @Column({ name: 'name_cn' })
  nameCn: string;
  @Column({ name: 'name_en' })
  nameEn: string;
  @Column({ name: 'status' })
  status: string;
  @Column({ name: 'weight' })
  weight: number;
}
