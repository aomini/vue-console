import { SSOAccount, COCOS_ORIGIN } from '../models/ssoAccount';
import { ListReply, ListParams } from '../models/listReply';
import { ProjectCocos } from '../models/projectCocos';
import { VendorInfo } from '../models/vendorInfo';
import { createNewProject, updateProjectForCocos } from './project';
import { md5 } from '../utils/encryptTool';
import { config } from '../config';
import { createQueryBuilder, getManager } from 'typeorm';
import * as queryString from 'query-string';
import axios from 'axios';
import { CompanyCocos } from '../models/companyCocos';

/**
 * @description 检查账号是否已存在
 * @param uid cocos uid
 */
export const getAccount = async(uid: number) => {
  const builder = createQueryBuilder(SSOAccount, 'ssoAccount');
  const account = await builder.leftJoinAndSelect('ssoAccount.userProfile', 'userProfile')
    .where('ssoAccount.uid = :uid and ssoAccount.origin = :origin', { uid: uid, origin: COCOS_ORIGIN }).getOne();
  return account;
};

/**
 * @description cocos调用API鉴权，参数信息：https://www.cocos.com/docs/services/service-switch/
 * @param sign
 * @param uid
 * @param game_id
 * @param game_name
 * @param corporation_id
 * @param action_type
 * @return {boolean} 鉴权状态
 */
export const apiAuth = (queryObj: any) => {
  const paramObj = Object.assign({}, queryObj, { sign: undefined });
  const generatedSign = md5(`${decodeURIComponent(queryString.stringify(paramObj))}${config.cocos.appSecret}`).toString('hex');
  if (queryObj.sign !== generatedSign) {
    return false;
  }
  return true;
};

export const getCocosProject = async(game_id: number) => {
  const project = ProjectCocos.findOne({ where: { gameId : game_id } });
  return project;
};

/**
 * @description 创建cocos关联的项目
 * @param uid
 * @param game_id
 * @param game_name
 * @param corporation_id
 * @param action_type
 */
export const upsertCocosProject = async (uid: number, game_id: number, game_name: string, action_type: number, company_id?: number, project_id?: string, sync_status?: number) => {
  const cocosProject = new ProjectCocos();
  cocosProject.uid = uid;
  cocosProject.gameId = game_id;
  cocosProject.name = game_name;
  cocosProject.actionType = action_type;
  if (company_id) {
    cocosProject.companyId = company_id;
  }
  if (project_id) {
    cocosProject.projectId = project_id;
  }
  if (sync_status) {
    cocosProject.syncStatus = sync_status;
  }
  cocosProject.created = new Date().getTime();
  await cocosProject.save();
  return cocosProject;
};

/**
 * @description 在cocos端创建游戏项目信息
 * @param game_name 游戏名称
 * @param corporation_id 公司类型
 * @param uid
 */
export const createRemoteCocosProject = async (game_name: string, corporation_id: number, uid, company_id: number, project: any) => {
  const url = `${config.cocos.apiUrl}/game/create`;
  const account: any = await SSOAccount.findOne({ where: { uid: uid } });
  const params: any = {
    app_key: config.cocos.appKey,
    session_token: account.token,
    corporation_id: corporation_id,
    game_name: game_name ,
    game_type: 3,
    game_sub_type: 1,
    game_icon: ''
  };
  const sign = md5(`${decodeURIComponent(queryString.stringify(params))}${config.cocos.appSecret}`).toString('hex');
  params.sign = sign;
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: queryString.stringify(params),
    url
  };
  const ret: any = await axios(options);
  if (ret && ret.data.error_code === 'success') {
    const game_id = ret.data.game_id;
    await upsertCocosProject(uid, game_id, game_name, 1, company_id, project.projectId, 2);
    return true;
  } else {
    return false;
  }
};

const GET_ALL_GAMES_CORPORATION_ID = ''; // 获取所有游戏传空字符串
const PERSONAL_CORPORATION_ID = 0; // 个人
const PERSONAL_CORPORATION_UID = 0; // 个人

/**
 * @description 检查项目对应关系，删除无权限的项目关系
 * @param uid
 * @param gameIds
 */
const checkoutOwnProject = async(uid: number, gameIds: Object) => {
  const projects = await ProjectCocos.find({ uid: uid }) || [];
  for (const item of projects) {
    if (!gameIds[item.gameId]) {
      const projectCocos = await ProjectCocos.findOne({ uid: uid, gameId: item.gameId });
      await ProjectCocos.remove(projectCocos);
    }
  }
};

/**
 * @description 同步公司项目信息
 * @param game_id
 * @param game_name
 * @param action_type
 * @param corporation_id
 */
const syncCompanyCocosProject = async(game_id: number, game_name: string, action_type: number, corporation_id: number) => {
  let projectCocos = await ProjectCocos.findOne({ gameId: game_id, corporationId: corporation_id });
  const status = action_type === 2 ? false : true;
  if (!projectCocos) {
    const companyCocos = await CompanyCocos.findOne({ corporationId: corporation_id });
    const projectReply = await createNewProject(game_name, companyCocos.companyId, status);
    projectCocos = new ProjectCocos();
    projectCocos.gameId = game_id;
    projectCocos.uid = PERSONAL_CORPORATION_UID;
    projectCocos.name = game_name;
    projectCocos.companyId = projectReply.company.id;
    projectCocos.projectId = projectReply.projectId;
    projectCocos.corporationId = corporation_id;
    projectCocos.syncStatus = 2;
    projectCocos.actionType = action_type;
    projectCocos.created = new Date().getTime();
    await projectCocos.save();
  } else {
    await updateProjectForCocos(projectCocos.projectId, projectCocos.name, status);
    projectCocos.actionType = action_type;
    await projectCocos.save();
  }
  return projectCocos;
};

/**
 * @description 同步个人项目信息
 * @param uid
 * @param company_id
 * @param game_id
 * @param game_name
 * @param action_type
 */
const syncPersonalCocosProject = async(uid: number, company_id: number, game_id: number, game_name: string, action_type: number) => {
  let projectCocos = await ProjectCocos.findOne({ gameId: game_id, uid: uid });
  const status = action_type === 2 ? false : true;
  if (!projectCocos) {
    const projectReply = await createNewProject(game_name, company_id, status);
    projectCocos = new ProjectCocos();
    projectCocos.gameId = game_id;
    projectCocos.uid = uid;
    projectCocos.name = game_name;
    projectCocos.companyId = company_id;
    projectCocos.projectId = projectReply.projectId;
    projectCocos.corporationId = PERSONAL_CORPORATION_ID;
    projectCocos.syncStatus = 2;
    projectCocos.actionType = action_type;
    projectCocos.created = new Date().getTime();
    await projectCocos.save();
  } else {
    await updateProjectForCocos(projectCocos.projectId, projectCocos.name, status);
    projectCocos.actionType = action_type;
    await projectCocos.save();
  }
  return projectCocos;
};

/**
 * @description 绑定公司项目和个人的关系
 * @param uid
 * @param company_id
 * @param project_id
 * @param game_id
 * @param game_name
 * @param action_type
 */
const bindRelationship = async(uid: number, company_id: number, project_id: string, game_id: number, game_name: string, action_type: number) => {
  let projectCocos = await ProjectCocos.findOne({ uid: uid , gameId: game_id });
  if (!projectCocos) {
    projectCocos = new ProjectCocos();
    projectCocos.gameId = game_id;
    projectCocos.uid = uid;
    projectCocos.name = game_name;
    projectCocos.companyId = company_id;
    projectCocos.projectId = project_id ;
    projectCocos.corporationId = PERSONAL_CORPORATION_ID;
    projectCocos.syncStatus = 2;
    projectCocos.actionType = action_type;
    projectCocos.created = new Date().getTime();
    await projectCocos.save();
  } else {
    const status = action_type === 2 ? false : true;
    await updateProjectForCocos(projectCocos.projectId, projectCocos.name, status);
    projectCocos.actionType = action_type;
    await projectCocos.save();
  }
};
/**
 * @description 同步端cocos项目信息避免项目不同步
 * @param uid
 * @param company_id
 */
export const syncRemoteCocosProject = async (uid: number, companyId: number) => {
  const url = `${config.cocos.apiUrl}/game/search`;
  const account: any = await SSOAccount.findOne({ where: { uid: uid } });
  const params: any = {
    app_key: config.cocos.appKey,
    session_token: account.token,
    corporation_id: GET_ALL_GAMES_CORPORATION_ID
  };
  const sign = md5(`${decodeURIComponent(queryString.stringify(params))}${config.cocos.appSecret}`).toString('hex');
  params.sign = sign;
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: queryString.stringify(params),
    url: url
  };
  const ret: any = await axios(options);
  if (ret && ret.data.error_code === 'success') {
    const gameIds = {};
    for (const g of ret.data.games) {
      const action_type = g.service_enabled ? 1 : 2;
      const corporation_id = Number(g.corporation_id);
      if (corporation_id !== 0) {
        // 1.创建公司项目
        // 2.绑定公司项目和个人账号的关系
        const projectCocos = await syncCompanyCocosProject(g.game_id, g.game_name, action_type, corporation_id);
        await bindRelationship(uid, projectCocos.companyId, projectCocos.projectId, g.game_id, g.game_name, action_type);
      } else {
        // 1.创建个人项目
        await syncPersonalCocosProject(uid, companyId, g.game_id, g.game_name, action_type);
      }
      gameIds[g.game_id] = true;
    }
    await checkoutOwnProject(uid, gameIds);
  } else {
    console.error('syncRemoteCocosProject:', url, ret);
  }
};

export const getProjectsByCompany = async (params: ListParams): Promise<ListReply<any>> => {
  const listReply: ListReply<VendorInfo> = {
    total: 0,
    items: []
  };

  const corporation = await CompanyCocos.findOne({ corporationId: params.params.corporationId });
  const corporationCompanyId = corporation ? corporation.companyId : 0 ;
  let whereStr;
  if (corporation) {
    whereStr = '(vendorInfo.company = :companyId or vendorInfo.company = :corporationCompanyId and project_cocos.uid = :uid)';
  } else {
    whereStr = '(vendorInfo.company = :companyId and project_cocos.uid = :uid)';
  }
  const uid = params.params.uid;

  const vendorInfoDB = getManager().getRepository(VendorInfo);
  let vendorInfoDBQuery = vendorInfoDB.createQueryBuilder('vendorInfo')
    .innerJoinAndSelect('project_cocos', 'project_cocos', `project_cocos.project_id=vendorInfo.project_id`)
    .where(whereStr, { companyId: params.params.companyId, corporationCompanyId: corporationCompanyId, uid: uid });

  if (params.params.status) {
    vendorInfoDBQuery.andWhere('vendorInfo.status = :status', { status: params.params.status });
  } else {
    vendorInfoDBQuery.andWhere('vendorInfo.is_deleted = 0');
  }

  if (params.params.key) {
    vendorInfoDBQuery = vendorInfoDBQuery.andWhere('(vendorInfo.key like :key or vendorInfo.name like :key)', { key: `%${params.params.key}%` });
  }

  let prop = 'vendorInfo.createdAt';
  // let order;
  if (params.params.sortProp === 'name') {
    prop = 'vendorInfo.name';
  }
  if (params.params.sortProp === 'key') {
    prop = 'vendorInfo.key';
  }
  if (params.params.sortProp === 'status') {
    prop = 'vendorInfo.status';
  }
  // if (params.params.sortOrder === 'ascending') {
  //   order = 'ASC';
  // } else {
  //   order = 'DESC';
  // }

  // vendorInfoDBQuery = vendorInfoDBQuery.addOrderBy(prop, order);
  if (!params.params.fetchAll) {
    vendorInfoDBQuery = vendorInfoDBQuery.offset(params.skip).limit(params.limit);
  }
  const [items, total] = await vendorInfoDBQuery.getManyAndCount();

  listReply.total = total;
  listReply.items = items;
  return listReply;
};

/**
 * @description 更新 cocos端 项目信息状态
 * @param uid cocos 用户 id
 * @param projectId dashboard 项目 id
 * @param status dashboard 项目状态
 */
export const updateRemoteCocosProject = async (uid: number, projectId: string, status: boolean) => {
  const turnOnUrl = `${config.cocos.apiUrl}/game/turnOnService`;
  const turnOffUrl = `${config.cocos.apiUrl}/game/turnOffService`;
  const account: any = await SSOAccount.findOne({ where: { uid: uid } });
  const cocosProject: any = await ProjectCocos.findOne({ where: { projectId: projectId } });
  const action_type = status ? 1 : 2;
  const params: any = {
    app_key: config.cocos.appKey,
    session_token: account.token,
    game_id: cocosProject.gameId
  };
  const sign = md5(`${decodeURIComponent(queryString.stringify(params))}${config.cocos.appSecret}`).toString('hex');
  params.sign = sign;
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: queryString.stringify(params),
    url: turnOnUrl
  };
  if (!status) {
    options.url = turnOffUrl;
  }
  // 项目信息未做修改，直接返回true
  if ((status && cocosProject.actionType === 1) || (!status && cocosProject.actionType === 2)) {
    return true;
  }
  const ret: any = await axios(options);
  if (ret && ret.data.error_code === 'success') {
    cocosProject.actionType = action_type;
    await cocosProject.save();
    return true;
  } else {
    return false;
  }
};
