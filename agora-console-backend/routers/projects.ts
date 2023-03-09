import * as Router from 'koa-router';
import * as ProjectCtrl from '../controller/project';
import * as TokenCtrl from '../controller/token';
import { authUser } from '../controller/auth';
import {
  checkReadPermission,
  checkWritePermission,
  checkSudoPermission,
  checkAuthenticationPermission,
  checkTwoStepVerificationPermission
} from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);
const MODULE_NAME = 'ProjectManagement';
router.get('/projects', ProjectCtrl.getProjectsByCompany);

router.get('/vendorGroup', ProjectCtrl.getVendorGroupByCompanyId);

router.post('/temp-token', checkReadPermission(MODULE_NAME), TokenCtrl.generateTempToken);
router.get('/token', checkReadPermission(MODULE_NAME), TokenCtrl.generateAccessToken2);
router.get('/chat/token', checkReadPermission(MODULE_NAME), TokenCtrl.generateChatToken);

router.get('/project/all-project-permission', ProjectCtrl.checkIfAllProjectsPermission);

router.get('/projects/checkLimit', checkReadPermission(MODULE_NAME), ProjectCtrl.checkAppLimit);

router.get('/project/usecases', ProjectCtrl.getProjectUsecaseList);

router.get('/project/:projectId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectDetail);

router.get('/project/:projectId/whiteboard-token', checkReadPermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getWhiteBoardToken);
router.get('/project/:projectId/apaas', checkReadPermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getApaasConfig);

router.post('/project', checkAuthenticationPermission(), checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.createNewProject);

router.post('/onboardingProject', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.createOnboardingProject);

router.post('/project/:projectId/signkey', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.sendCertificateEmail);

router.post('/project/token-record', checkWritePermission(MODULE_NAME), TokenCtrl.generateUrlSignRecord);

router.put('/project/:projectId', checkAuthenticationPermission(), checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateProject);

router.put('/project/:projectId/name', checkAuthenticationPermission(), checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateProjectName);

router.put('/project/:projectId/status', checkAuthenticationPermission(), checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateProjectStatus);

router.put('/project/:projectId/enable-primary-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.enablePrimaryCert);

router.put('/project/:projectId/enable-backup-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.enableBackupCert);

router.put('/project/:projectId/switch-primary-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.switchToPrimaryCert);

router.put('/project/:projectId/delete-no-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.deleteNoCert);

router.delete('/project/:projectId/delete-backup-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), checkTwoStepVerificationPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.deleteBackupCert);

router.put('/project/:projectId/update-backup-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateBackupCert);

router.get('/project/:projectId/backup-cert', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getBackupCert);

router.put('/project/:projectId/whiteboard-token', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateWhiteBoardToken);

router.put('/project/:projectId/apaas', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateApaasConfig);

router.put('/project/:projectId/co-host-token', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateCoHostToken);
router.get('/project/:projectId/upstreams', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectUpstreams);
router.put('/project/:projectId/upstreams/:upstreamId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateUpstreams);
router.get('/project/:projectId/chains', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectChains);
router.put('/project/:projectId/chains/:chainsId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateChains);
router.get('/project/:projectId/sdk-chains', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectSDKChains);
router.put('/project/:projectId/sdk-chains/:chainsId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateSDKChains);
router.get('/project/:projectId/manual-records', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getChainsManualRecords);
router.get('/project/:projectId/ktv', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectKTVInfo);
router.delete('/project/:projectId/upstreams/:upstreamId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.deleteProjectUpstreams);
router.delete('/project/:projectId/chains/:chainsId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.deleteProjectChains);
router.delete('/project/:projectId/sdk-chains/:chainsId', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.deleteProjectSDKChains);
router.get('/project/:projectId/ktv', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectKTVInfo);
router.post('/project/:projectId/ktv', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.postProjectKTVInfo);
router.post('/project/:projectId/fpa', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.createFPAService);
router.post('/project/:projectId/v2/fpa', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.createFPAServiceNew);
router.get('/fpa/machines', ProjectCtrl.getFPAMachineData);
router.post('/fpa/recommendedFilter', ProjectCtrl.getFPARecommendedFilter);

router.get('/project/:projectId/extension-setting', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectExtensionSetting);
router.get('/project/:projectId/moderation', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectModeration);
router.post('/project/:projectId/moderation', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.setProjectModeration);

router.post('/project/:projectId/relation', checkReadPermission(MODULE_NAME), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateProjectRelation);

router.get('/project/:projectId/cloud-proxy/status', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getCloudProxyStatus);
router.post('/project/:projectId/cloud-proxy/status', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateCloudProxyStatus);
router.get('/project/:projectId/cloud-proxy/pcu-limit', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getCloudProxyPCULimit);
router.post('/project/:projectId/cloud-proxy/pcu-limit', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateCloudProxyPCULimit);

// NCS
router.get('/project/:projectId/ncs', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getProjectNCS);
router.get('/project/:projectId/ncs/events', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getNCSEvents);
router.post('/project/:projectId/ncs/check', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.NCSHealthCheck);
router.delete('/project/:projectId/ncs/:configId', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.closeNCS);
router.post('/project/:projectId/ncs/audit', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.SubmitNCSConfigAudit);
router.get('/project/:projectId/ncs/audit', checkWritePermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getNCSConfigAudit);

// IOT
router.get('/project/:projectId/iot', checkReadPermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.getIotStatus);
router.put('/project/:projectId/iot', checkReadPermission(MODULE_NAME), checkSudoPermission(), ProjectCtrl.checkProjectPermission, ProjectCtrl.updateIotStatus);
export { router };
