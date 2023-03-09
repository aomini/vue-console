import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class NetlessAccess extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column()
  ak: string;

  @Column()
  sk: string;

  @Column({ name: 'is_ban' })
  isBan: number;

  @Column({ name: 'is_deleted' })
  isDeleted: number;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column({ name: 'app_uuid' })
  appUUID: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
