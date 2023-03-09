import { Context } from 'koa';
import { response } from '../utils/response';
import { OktaBasicAuth } from '../models/oktaBasicAuth';
import { SamlIdp } from '../models/samlIdp';
import { config } from '../config';

const ssoUrl = `${config.oauth2.baseURL}/api/v0/saml/idp/callback`;

export const SsoManagement = {
  async getSCIMBasicAuthData(ctx: Context) {
    const { companyId } = ctx.session;
    let basicAuthData = await OktaBasicAuth.findOneByCompanyId(companyId);
    if (!basicAuthData || !basicAuthData.companyId) {
      const model = new OktaBasicAuth();
      model.companyId = companyId;
      model.username = OktaBasicAuth.generateUsername();
      model.password = OktaBasicAuth.generatePassword();
      basicAuthData = await model.save();
    }
    return response(ctx, 200, {
      code: 0,
      data: basicAuthData ? {
        username: basicAuthData.username,
        password: basicAuthData.password,
        enable: basicAuthData.isEnabled
        // tslint:disable-next-line:no-null-keyword
      } : null,
      msg: ''
    });
  },

  async renewSCIMBasicAuthData(ctx: Context) {
    const { companyId } = ctx.session;
    const { enable, refresh } = ctx.request.body;
    if (typeof enable !== 'boolean' || typeof refresh !== 'boolean') {
      return response(ctx, 200, {
        code: 400,
        // tslint:disable-next-line:no-null-keyword
        data: null,
        msg: 'Input Error'
      });
    }

    let basicAuthData = await OktaBasicAuth.findOneByCompanyId(companyId);
    if (!basicAuthData || !basicAuthData.companyId) {
      basicAuthData = new OktaBasicAuth();
      basicAuthData.companyId = companyId;
      basicAuthData.username = OktaBasicAuth.generateUsername();
    }
    if (!basicAuthData || refresh) {
      basicAuthData.password = OktaBasicAuth.generatePassword();
    }
    basicAuthData.isEnabled = enable;
    await basicAuthData.save();

    return response(ctx, 200, {
      code: 0,
      data: {
        username: basicAuthData.username,
        password: basicAuthData.password,
        enable: basicAuthData.isEnabled
      },
      msg: ''
    });
  },

  async getSAMLData(ctx: Context) {
    const { companyId } = ctx.session;
    const samlData = await SamlIdp.findOneByCompanyId(companyId);
    return response(ctx, 200, {
      code: 0,
      data: samlData ? {
        enable: true,
        idpId: samlData.idpId,
        name: samlData.name,
        audienceUri: samlData.audienceUri,
        ssoUrl: ssoUrl,
        idpEntityId: samlData.idpEntityId,
        idpLoginUrl: samlData.idpLoginUrl,
        certificateStr: samlData.certificateStr
        // tslint:disable-next-line:no-null-keyword
      } : {
        enable: false,
        idpId: companyId,
        name: ctx.state.user.company.name,
        audienceUri: `${config.oauth2.baseURL}/${companyId}/saml/SSO`,
        ssoUrl: ssoUrl
      },
      msg: ''
    });
  },

  async updateSAMLData(ctx: Context) {
    const { companyId } = ctx.session;
    const { idpEntityId, idpLoginUrl, certificateStr } = ctx.request.body;

    if (!idpEntityId || !idpLoginUrl || !certificateStr) {
      return response(ctx, 200, {
        code: 400,
        // tslint:disable-next-line:no-null-keyword
        data: null,
        msg: 'Parameters Lack'
      });
    }

    let samlData = await SamlIdp.findOneByCompanyId(companyId);
    if (!samlData || !samlData.rid) {
      samlData = new SamlIdp();
      samlData.companyId = companyId;
      samlData.idpId = companyId;
      samlData.name = ctx.state.user.company.name;
      samlData.audienceUri = `${config.oauth2.baseURL}/${companyId}/saml/SSO`;
    }

    samlData.idpEntityId = idpEntityId;
    samlData.idpLoginUrl = idpLoginUrl;
    samlData.certificateStr = certificateStr;
    const row = await samlData.save();
    if (!row || !row) {
      return response(ctx, 200, {
        code: 500,
        // tslint:disable-next-line:no-null-keyword
        data: null,
        msg: 'Internal Server Error'
      });
    }
    return response(ctx, 200, {
      code: 0,
      data: {
        enable: true,
        idpId: row.idpId,
        name: row.name,
        ssoUrl: ssoUrl,
        audienceUri: row.audienceUri,
        idpEntityId: row.idpEntityId,
        idpLoginUrl: row.idpLoginUrl,
        certificateStr: row.certificateStr
      },
      msg: ''
    });
  },

  async removeSAMLData(ctx: Context) {
    const { companyId } = ctx.session;
    const samlData = await SamlIdp.findOneByCompanyId(companyId);
    if (!samlData || !samlData.rid) {
      return response(ctx, 200, {
        code: 400,
        // tslint:disable-next-line:no-null-keyword
        data: null,
        msg: 'Input Error'
      });
    }
    await samlData.remove();
    return response(ctx, 200, {
      code: 0,
      data: {
        enable: false,
        idpId: companyId,
        name: ctx.state.user.company.name,
        ssoUrl: ssoUrl,
        audienceUri: `${config.oauth2.baseURL}/${companyId}/saml/SSO`
      },
      msg: ''
    });
  }
};
