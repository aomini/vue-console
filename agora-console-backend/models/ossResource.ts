import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class OssResource extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'bucket_name' })
  bucketName: string;

  @Column({ name: 'oss_key' })
  ossKey: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  caller: string;

  @Column()
  size: number;

  @Column({ name: 'is_deleted' })
  isDeleted: number;

  @Column({ name: 'oss_state' })
  ossState: number;
}
