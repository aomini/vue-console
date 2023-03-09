import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class NetlessCompany extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column()
  strategy: string;

  @Column({ name: 'access_keys_max_count' })
  accessKeysMaxCount: number;

  @Column({ name: 'apps_max_count' })
  appsMaxCount: number;

  @Column({ name: 'room_users_max_count' })
  roomUsersMaxCount: number;

  @Column()
  version: number;

  @Column({ name: 'is_auth_cdn' })
  isAuthCdn: number;

  @Column({ name: 'is_region_required' })
  isRegionRequired: number;

  @Column({ name: 'is_ban' })
  isBan: number;

  @Column({ name: 'is_deleted' })
  isDeleted: number;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
