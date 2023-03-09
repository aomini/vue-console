import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class CertificateBackupInfo extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'sign_key_backup' })
  signKeyBackup: string;

  @Column({ name: 'status' })
  status: number;

  @Column({ name: 'company_id' })
  companyId: number;
}
