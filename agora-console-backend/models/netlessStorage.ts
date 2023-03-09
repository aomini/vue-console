import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class NetlessStorage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  uid: string;

  @Column({ name: 'team_uuid' })
  teamUUID: string;

  @Column()
  ak: string;

  @Column()
  sk: string;

  @Column()
  bucket: string;

  @Column()
  domain: string;

  @Column()
  path: string;

  @Column()
  provider: string;

  @Column()
  region: string;

  @Column({ name: 'data_region' })
  dataRegion: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;
}
