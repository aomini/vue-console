import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('extension')
export class ProjectExtension extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'extension_id' })
  extensionId: string;
  @Column({ name: 'name_cn' })
  nameCn: string;
  @Column({ name: 'name_en' })
  nameEn: string;
  @Column({ name: 'extension_type_id' })
  extensionTypeId: string;
  @Column({ name: 'description_cn' })
  descriptionCn: string;
  @Column({ name: 'description_en' })
  descriptionEn: string;
  @Column({ name: 'track_id' })
  trackId: string;
  @Column({ name: 'config_mode' })
  configMode: string;
  @Column({ name: 'area' })
  area: string;
  @Column({ name: 'status' })
  status: string;
  @Column({ name: 'icon' })
  icon: string;
  @Column({ name: 'is_public' })
  isPublic: number;
  @Column({ name: 'need_token' })
  needToken: number;
  @Column({ default: 0 })
  weight: number;
  @Column({ name: 'extension_config_str' })
  extensionConfigStr: string;
  @Column({ name: 'menu_config' })
  menuConfig: string;
  @Column({ name: 'link_config' })
  linkConfig: string;
}
