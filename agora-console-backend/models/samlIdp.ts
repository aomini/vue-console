import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'saml_idp' })
export class SamlIdp extends BaseEntity {
  @PrimaryGeneratedColumn({ name: '_rid' })
  rid: number;

  @Column({ name: 'idp_id' })
  idpId: string;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column()
  name: string;

  @Column({ name: 'audience_uri' })
  audienceUri: string;

  @Column({ name: 'idp_entity_id' })
  idpEntityId: string;

  @Column({ name: 'idp_login_url' })
  idpLoginUrl: string;

  @Column({ name: 'certificate_str' })
  certificateStr: string;

  @Column({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_time' })
  updateTime: Date;

  static findOneByCompanyId(companyId: number) {
    return SamlIdp.findOne({ where: { companyId } });
  }

  static findOneByIDPId(idpId: number) {
    return SamlIdp.findOne({ where: { idpId } });
  }
}
