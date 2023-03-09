import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class NetlessProject extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column({ name: 'app_uuid' })
  appUUID: string;

  @Column()
  name: string;

  @Column({ name: 'is_deleted' })
  isDeleted: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
