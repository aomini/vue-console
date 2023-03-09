import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'netless_2_project' })
export class Netless2Project extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column({ name: 'app_uuid' })
  appUUID: string;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
