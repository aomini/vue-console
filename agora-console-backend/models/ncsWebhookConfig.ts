import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ncs_webhook_config' })
export class NcsWebhookConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'app_id' })
  appId: number;

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

  @Column({ name: 'delivery_service' })
  deliveryService: number;

  @Column({ name: 'use_ip_whitelist' })
  useIpWhitelist: boolean;

  @Column()
  internal: boolean;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at' })
  deletedAt: Date | null;
}
