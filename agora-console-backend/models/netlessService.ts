import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class NetlessService extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column({ name: 'app_uuid' })
  appUUID: string;

  @Column()
  configuration: string;

  @Column({ name: 'is_enabled' })
  isEnabled: number;

  @Column()
  type: string;

  @Column({ name: 'data_region' })
  dataRegion: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
