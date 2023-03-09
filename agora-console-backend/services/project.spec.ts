import * as assert from 'assert';
import 'mocha';
import { getConnection } from "typeorm";
import { getProjectsByCompany, getProjectDetail, createNewProject, updateProject } from './project';
import { ListParams } from '../models/listReply';
import { VendorInfo } from '../models/vendorInfo'
import { Project } from '../models/project'
import { Company } from '../models/company'

describe('project-service', () => {
  before(async()=>{
    let company = new Company()
    company.id = 0
    let vendorInfo1 = new VendorInfo()
    let project1 = new Project()
    project1.id = 'test'
    project1.name = 'testProject'
    project1.status = 1
    vendorInfo1.project = project1
    vendorInfo1.company = company
    await vendorInfo1.save()

    let vendorInfo2 = new VendorInfo()
    let project2 = new Project()
    project2.id = 'test02'
    project2.name = 'testProject02'
    project2.status = -1
    vendorInfo2.project = project2
    vendorInfo2.company = company
    await vendorInfo2.save()
  })
  describe('project-list', () => {
    it('total-should-eq-0', async () => {
      const params = new ListParams(0, 0);
      const ret = await getProjectsByCompany(params);
      assert.equal(ret.total, 0);
    });
    it('status filter', async () => {
      const params = new ListParams(1, 10, { companyId: 0 })
      const ret = await getProjectsByCompany(params);
      assert.equal(ret.total, 1);
    });
    it('search filter', async () => {
      const params = new ListParams(1, 10, { companyId: 0, searchValue: 'testProject02' })
      const ret = await getProjectsByCompany(params);
      assert.equal(ret.total, 1);
    })
  });
  describe('project-detail', () => {
    it('get project detail', async () => {
      const ret = await getProjectDetail('test');
      assert.equal(ret.id, 'test');
    })
  })
  describe('create-project', () => {
    it('create a new project', async () => {
      const ret = await createNewProject('test', 0);
      assert.notEqual(ret.id, undefined)
    })
  })
  describe('update-project', () => {
    it('update an existing project', async () => {
      const ret = await updateProject('test', 'testProject02', true, true);
      assert.equal(ret.name, 'testProject02')
    })
  })
  after(async()=>{
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Project)
      .where("id = :id", { id: 'test' })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Project)
      .where("id = :id", { id: 'test02' })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Company)
      .where("id > :id", { id: 0 })
      .execute();
    await getConnection()
      .createQueryBuilder()
      .delete()
      .from(VendorInfo)
      .where("id > :id", { id: 0 })
      .execute();
  });
});
