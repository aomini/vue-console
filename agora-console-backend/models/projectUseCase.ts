import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class ProjectUseCase extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'use_case_id' })
  useCaseId: string;

  @Column({ name: 'name_cn' })
  nameCn: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'case_area' })
  caseArea: string;

  @Column({ name: 'internal_industry' })
  internalIndustry: string;

  @Column({ name: 'link_cn' })
  linkCn: string;

  @Column({ name: 'link_en' })
  linkEn: string;
}

@Entity()
export class CompanyIndustryArrangement extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'arrangement_id' })
  arrangementId: string;

  @Column({ name: 'company_industry_id' })
  companyIndustryId: string;

  @Column({ name: 'use_case_id' })
  useCaseId: string;
}

@Entity()
export class CompanyIndustryMetadata extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'company_industry_id' })
  companyIndustryId: string;

  @Column({ name: 'name_cn' })
  nameCn: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'internal_industry_id' })
  internalIndustryId: string;
}

@Entity()
export class InternalIndustryMetadata extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'internal_industry_id' })
  internalIndustryId: string;

  @Column({ name: 'name_cn' })
  nameCn: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'case_area' })
  caseArea: string;
}

@Entity()
export class SectorMetadata extends BaseEntity {
  @PrimaryGeneratedColumn()
  _rid: number;

  @Column({ name: 'sector_id' })
  sectorId: string;

  @Column({ name: 'internal_industry_id' })
  internalIndustryId: string;

  @Column({ name: 'name_cn' })
  nameCn: string;

  @Column({ name: 'name_en' })
  nameEn: string;
}
