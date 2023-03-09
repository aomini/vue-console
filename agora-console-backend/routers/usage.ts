import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as UsageCtrl from '../controller/usage';
import * as ProjectCtrl from '../controller/project';
import { checkReadPermission, checkSudoPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2/usage' });

router.use(authUser);
const MODULE_NAME = 'Usage';
router.use(checkReadPermission(MODULE_NAME));

router.get('/usageInfo', UsageCtrl.getUsageInfo);
router.get('/usageInfo/vendor', UsageCtrl.getMarketplaceUsageInfo);
router.get('/projects-usage', ProjectCtrl.getProjectsWithUsage);
router.get('/rtc-remaining', UsageCtrl.getRTCRemainingUsage);
router.get('/cloud-recording-remaining', UsageCtrl.getCloudRecordingRemainingUsage);
router.get('/uap/setting', UsageCtrl.getUapSetting);
router.post('/uap/setting', checkSudoPermission(), UsageCtrl.openUapSetting);
router.get('/metadata', UsageCtrl.getUsageMetadata);
router.get('/usageInfoBySku', UsageCtrl.getUsageInfoByModel);

export { router };
