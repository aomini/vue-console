import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as AgoraChatCtrl from '../controller/agoraChat';
import { checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);
const MODULE_NAME = 'ProjectManagement';

router.get('/chat/subscription', checkReadPermission(MODULE_NAME), AgoraChatCtrl.getCompanySubscription);
router.put('/chat/subscription', checkReadPermission(MODULE_NAME), AgoraChatCtrl.setCompanySubscription);
router.delete('/chat/subscription', checkReadPermission(MODULE_NAME), AgoraChatCtrl.deleteCompanySubscription);
router.get('/project/:projectId/chat/info', checkReadPermission(MODULE_NAME), AgoraChatCtrl.getProjectChatInfo);
router.post('/project/:projectId/chat/info', checkReadPermission(MODULE_NAME), AgoraChatCtrl.enableProjectChat);
router.post('/project/:projectId/chat/active', checkReadPermission(MODULE_NAME), AgoraChatCtrl.activeProjectChat);
router.post('/project/:projectId/chat/disactive', checkReadPermission(MODULE_NAME), AgoraChatCtrl.disactiveProjectChat);
router.get('/project/:projectId/chat/push/info', checkReadPermission(MODULE_NAME), AgoraChatCtrl.getProjectPushInfo);
router.post('/project/:projectId/chat/push', checkReadPermission(MODULE_NAME), AgoraChatCtrl.createProjectPushCertificate);
router.delete('/project/:projectId/chat/push/:certificate_id', checkReadPermission(MODULE_NAME), AgoraChatCtrl.deleteProjectPushInfo);
router.get('/project/:projectId/chat/callback/info', checkReadPermission(MODULE_NAME), AgoraChatCtrl.getProjectCallbackInfo);
router.delete('/project/:projectId/chat/callback/:rule_id', checkReadPermission(MODULE_NAME), AgoraChatCtrl.deleteProjectCallback);
router.post('/project/:projectId/chat/pre-callback', checkReadPermission(MODULE_NAME), AgoraChatCtrl.createPreCallbackRule);
router.post('/project/:projectId/chat/post-callback', checkReadPermission(MODULE_NAME), AgoraChatCtrl.createPostCallbackRule);
router.put('/project/:projectId/chat/pre-callback/:rule_id', checkReadPermission(MODULE_NAME), AgoraChatCtrl.updatePreCallbackRule);
router.put('/project/:projectId/chat/post-callback/:rule_id', checkReadPermission(MODULE_NAME), AgoraChatCtrl.updatePostCallbackRule);
router.get('/chat/function', checkReadPermission(MODULE_NAME), AgoraChatCtrl.getChatFunction);

export { router };
