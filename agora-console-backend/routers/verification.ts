import * as Router from 'koa-router';
import { authUser } from '../controller/auth';
import * as VerificationCtrl from '../controller/verification';

/**
 * 发送两步验证码
 * 检查两步验证状态
 * 启停两步验证功能：[PUT] /account/auth
 * TODO：
 *  - 启停两步验证时，输入验证码与启停应该是一个事务，所以要写成一个接口：后端判断验证成功后直接启停
 *  - 两步验证中间件应该独立于其他的中间件，尽量解耦
 *  - 可以在 session 中写入当前的验证状态，但最好有一个独立的模块来统一管理 session
 */
const router = new Router({ prefix: '/api/v2/verification' });
router.use(authUser);

router.post('/email', VerificationCtrl.generateEmailVerification);
router.post('/phone', VerificationCtrl.generatePhoneVerification);
router.post('/check', VerificationCtrl.checkVerification);

export { router };
