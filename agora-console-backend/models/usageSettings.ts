import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class SettingsType extends BaseEntity {
  @PrimaryColumn({ name: 'type_id' })
  typeId: number;

  @Column()
  value: string;
}

@Entity()
export class Settings extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => SettingsType)
  @JoinColumn({ name: 'type_id' })
  type: SettingsType;

  @Column()
  value: string;

  @Column()
  parent_id: number;
}

@Entity()
export class ProjectSettings extends BaseEntity {
  @PrimaryColumn({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @PrimaryColumn({ name: 'setting_id' })
  @OneToOne(type => Settings)
  @JoinColumn({ name: 'setting_id' })
  setting: Settings;

  @Column({ name: 'setting_group' })
  settingGroup: number;
}
