import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class CompanyAuthentication extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'identity_type' })
  identityType: number;

  @Column()
  status: number;
}

@Entity()
export class PersonIdentity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'auth_type' })
  authType: number;

  @Column()
  name: string;

  @Column()
  number: string;

  @Column({ name: 'face_photo_id' })
  facePhotoId: string;

  @Column({ name: 'face_photo_key' })
  facePhotoKey: string;

  @Column({ name: 'back_photo_id' })
  backPhotoId: string;

  @Column({ name: 'back_photo_key' })
  backPhotoKey: string;

  @Column()
  status: number;

  @Column({ name: 'submit_time' })
  submitTime: string;
}

@Entity()
export class CompanyIdentity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'company_id' })
  companyId: number;

  @Column({ name: 'auth_type' })
  authType: number;

  @Column()
  name: string;

  @Column({ name: 'credit_code' })
  creditCode: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  website: string;

  @Column({ name: 'license_photo' })
  licensePhoto: string;

  @Column({ name: 'license_photo_key' })
  licensePhotoKey: string;

  @Column({ name: 'legal_person_name' })
  legalPersonName: string;

  @Column({ name: 'legal_person_number' })
  legalPersonNumber: string;

  @Column({ name: 'operator_name' })
  operatorName: string;

  @Column({ name: 'operator_number' })
  operatorNumber: string;

  @Column()
  status: number;

  @Column({ name: 'submit_time' })
  submitTime: string;

  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'bank_branch' })
  bankBranch: string;

  @Column({ name: 'bank_account' })
  bankAccount: string;
}
