import * as Router from 'koa-router';
import * as MemberCtrl from '../controller/member';
import { authUser } from '../controller/auth';
import { checkWritePermission, checkSudoPermission, checkReadPermission } from '../controller/checkPermission';

const router = new Router({ prefix: '/api/v2' });

router.use(authUser);
const MODULE_NAME = 'Member&RoleManagement';

router.get('/members', checkReadPermission(MODULE_NAME), MemberCtrl.getMembersByCompany);
router.get('/member-amount', checkReadPermission(MODULE_NAME), MemberCtrl.getMembersAmountByCompany);
router.get('/members/checkMemberLimit', checkWritePermission(MODULE_NAME), MemberCtrl.checkMemberLimit);
router.get('/member/:email', checkWritePermission(MODULE_NAME), MemberCtrl.getMemberByEmail);

router.post('/member', checkWritePermission(MODULE_NAME), checkSudoPermission(), MemberCtrl.createMember);

router.put('/member', checkWritePermission(MODULE_NAME), checkSudoPermission(), MemberCtrl.updateMember);

router.delete('/member', checkWritePermission(MODULE_NAME), checkSudoPermission(), MemberCtrl.deleteMember);

export { router };
