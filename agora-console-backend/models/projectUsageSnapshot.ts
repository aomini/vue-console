import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class ProjectUsageSnapshot extends BaseEntity {
  @PrimaryColumn({ name: 'rid' })
  rid: number;

  @Column({ name: 'vendor_id' })
  vendorId: number;

  @Column({ name: 'sample_date' })
  sampleDate: Date;

  @Column({ name: 'usage_7d' })
  usage7d: number;

  @Column({ name: 'usage_30d' })
  usage30d: number;

  @Column({ name: 'update_ts' })
  updateTs: number;
}
