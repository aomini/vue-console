import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'rtm_webhook_config' })
export class RtmWebhookConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'app_id' })
  appId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'url_name' })
  urlName: string;

  @Column()
  url: string;

  @Column({ name: 'url_region' })
  urlRegion: string;

  @Column()
  secret: string;

  @Column()
  retry: boolean;

  @Column()
  enabled: boolean;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date | null;
}
