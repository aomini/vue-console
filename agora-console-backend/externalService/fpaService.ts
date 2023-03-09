import { Logger } from 'log4js';
import * as Client from '../utils/doveRequest';
import { config } from '../config';

export class FPAService {
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public makeRequest() {
    return Client.create(this.logger, {
      baseURL: config.FPA.baseURL,
      headers: {
        [config.FPA.key]: config.FPA.keyValue
      }
    });
  }

  public async getUpstreamsByVendorId(
    vendorId: number,
    page: number = 1,
    limit: number = 10,
    upstream_name = ''
  ) {
    const request = this.makeRequest();
    const ret = await request.get(`/api/v2/vendor/${vendorId}/upstreams`, {
      params: { page, limit, upstream_name }
    });
    return ret.data;
  }

  public async getChainsByVendorId(
    vendorId: number,
    page: number = 1,
    limit: number = 10,
    chain_name = '',
    ip = ''
  ) {
    const request = this.makeRequest();
    const ret = await request.get(`/api/v2/vendor/${vendorId}/chains`, {
      params: { page, limit, chain_name, ip }
    });
    return ret.data;
  }

  public async getSDKChainsByVendorId(
    vendorId: number,
    page: number = 1,
    limit: number = 10,
    chain_name = '',
    ip = ''
  ) {
    const request = this.makeRequest();
    const ret = await request.get(`/api/v3/sdk_chains`, {
      params: { vendor_id: vendorId, page, limit, chain_name, ip }
    });
    return ret.data;
  }

  public async createChains(vendorId: number, params: any) {
    const request = this.makeRequest();
    const ret = await request.post(`/api/v4/chains`, params, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async updateChains(vendorId: number, chainId: number, params: any) {
    const request = this.makeRequest();
    const ret = await request.patch(`/api/v4/chains/${chainId}`, params, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async createSDKChains(vendorId: number, params: any) {
    const request = this.makeRequest();
    const ret = await request.post(`/api/v4/sdk_chains`, params, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async updateSDKChains(vendorId: number, chainId: number, params: any) {
    const request = this.makeRequest();
    const ret = await request.patch(`/api/v4/sdk_chains/${chainId}`, params, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async createUpstreams(vendorId: number, params: any) {
    const request = this.makeRequest();
    const ret = await request.post(`/api/v2/upstreams`, params, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async updateUpstreams(
    vendorId: number,
    upstreamId: number,
    params: any
  ) {
    const request = this.makeRequest();
    const ret = await request.patch(`/api/v2/upstreams/${upstreamId}`, params, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async deleteUpstreams(vendorId: number, upstream_id: number) {
    const request = this.makeRequest();
    const ret = await request.delete(`/api/v2/upstreams/${upstream_id}`, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async deleteChains(vendorId: number, chain_id: number) {
    const request = this.makeRequest();
    const ret = await request.delete(`/api/v2/chains/${chain_id}`, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async deleteSDKChains(vendorId: number, chain_id: number) {
    const request = this.makeRequest();
    const ret = await request.delete(`/api/v3/sdk_chains/${chain_id}`, {
      params: { vendor_id: vendorId }
    });
    return ret.data;
  }

  public async getMachineList() {
    const request = this.makeRequest();
    const ret = await request.get(`/machine_list`);
    return ret.data;
  }

  public async getMachineData() {
    const result: any = {
      continent: [],
      country: [],
      city: []
    };
    const data = await this.getMachineList();
    if (data) {
      for (const continent in data) {
        result.continent.push(continent);
        for (const country in data[continent]) {
          result.country.push(country);
          result.city.push(...data[continent][country]);
        }
      }
    }
    return result;
  }

  public async getRecommendedFilter(machine_ips: string[]) {
    const request = this.makeRequest();
    const ret = await request.get(`/api/v4/recommended_filter`, { params: { machine_ips: machine_ips.join(',') } });
    return ret.data;
  }

  public gernerateUpstreamsParams(data: any) {
    const params = {
      name: data.name || '',
      protocol: data.protocol || 'tcp',
      load_balancer_type: 'round_robin',
      sources: [],
      addition_infos: {}
    };
    data.sourceIps.forEach((ip) => {
      params.sources.push({
        type: data.sourceType,
        address: ip,
        port: Number(data.sourcePort),
        weight: 0,
        priority: 0
      });
    });
    return params;
  }

  public gernerateUpstreamsUpdateParams(data: any) {
    const params = {
      name: data.name || '',
      protocol: data.protocol,
      sources: []
    };
    data.sourceIps.forEach((ip) => {
      params.sources.push({
        type: data.sourceType,
        address: ip,
        port: Number(data.port),
        weight: 0,
        priority: 0
      });
    });
    return params;
  }

  public gernerateChainsParams(data: any) {
    const params = {
      unique_id: data.unique_id,
      hint: data.name || '',
      inbound: {
        protocol: 'tcp'
      },
      upstream_id: data.upstream_id,
      bandwidth_hardlimit: data.bandwidth_hardlimit * 125000,
      use_domain_name: data.use_domain_name,
      concurrency_limit: Number(data.concurrency_limit),
      addition_infos: {
        vName: data.name || ''
      },
      client_filters: {
        type: data.clientType,
        tags: data.clientTags,
        required_number: 1
      },
      server_filters: {
        type: data.serverType,
        tags: data.serverTags,
        required_number: 1
      }
    };
    if (data.use_domain_name) {
      delete params.client_filters;
    }
    if (data.chainsPort) {
      params['port'] = Number(data.chainsPort);
    }
    return params;
  }

  public checkCreateChainsParams(params: any) {
    if (params.ipaType === 'default' && params.chainsType === 'ipa') {
      if (
        params.chainsPort !== '' ||
        Number(params.concurrency_limit) !== 1000 ||
        Number(params.bandwidth_hardlimit) !== 10 ||
        params.use_domain_name
      ) {
        return false;
      }
    }
    return true;
  }

  public gernerateChainsUpdateParams(data: any) {
    const params = {
      hint: data.hint || '',
      client_filters: {
        type: data.clientType,
        tags: data.clientTags,
        required_number: 2
      }
    };
    return params;
  }

  public gernerateSDKChainsUpdateParams(data: any) {
    const params = {
      name: data.name || ''
    };
    return params;
  }

  public gernerateSDKChainsParams(data: any) {
    const params = {
      unique_id: data.unique_id,
      name: data.name || '',
      upstream: data.upstream_id,
      bandwidth: data.bandwidth_hardlimit * 125000,
      use_domain_name: data.use_domain_name,
      concurrency_limit: Number(data.concurrency_limit),
      addition_infos: {},
      server_filters: {
        type: data.serverType,
        tags: data.serverTags,
        required_number: 2
      }
    };
    return params;
  }
}
