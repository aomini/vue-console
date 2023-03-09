import { Entity, Column, PrimaryColumn } from 'typeorm';

export const CredentialsStatus = {
  ENABLED: 1,
  DISABLED: 0
};

export const CredentialsIsDownloaded = {
  DOWNLOADED: 1,
  NOT_DOWNLOADED: 0
};

@Entity({ database: 'authentication', name: 'credentials' })
export class AuthenticationCredentials {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column({ select: false })
  pass: string;

  @Column()
  companyId: number;

  @Column()
  status: number;

  @Column()
  downloaded: number;

  @Column()
  deletedAt: Date;
}
