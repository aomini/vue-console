// 白板数据中心
export enum IDC {
  China = 'cn',
  America = 'us',
  Singapore = 'sg',
  India = 'in',
  Britain = 'uk'
}

// IDC服务供应商
export enum Provider {
  aliyun = 'aliyun',
  qcloud = 'qcloud',
  huaweicloud = 'huaweicloud',
  ucloud = 'ucloud',
  qiniu = 'qiniu',
  aws = 'aws'
}

interface IDCAttribute {
  nameCN?: string;
  nameEN?: string;
  value: IDC;
  provider: ProviderAttribute[];
}

interface ProviderAttribute {
  nameCN?: string;
  nameEN?: string;
  display?: boolean; // 是否展示，缺省为否
  primary?: boolean; // 是否首选，缺省为否
  value: Provider;
  region: RegionAttribute[];
}

interface RegionAttribute {
  nameCN?: string;
  nameEN?: string;
  primary?: boolean; // 是否首选，缺省为否
  value: string;
}

export const regionChina: IDCAttribute = {
  nameCN: '中国',
  nameEN: 'China',
  value: IDC.China,
  provider: [
    {
      nameCN: '阿里云',
      value: Provider.aliyun,
      display: true,
      primary: true,
      region: [
        { nameCN: '华东1（杭州）', value: 'oss-cn-hangzhou' },
        { nameCN: '华东2（上海）', value: 'oss-cn-shanghai' },
        { nameCN: '华北1（青岛）', value: 'oss-cn-qingdao' },
        { nameCN: '华北2（北京）', value: 'oss-cn-beijing' },
        { nameCN: '华北3（张家口）', value: 'oss-cn-zhangjiakou' },
        { nameCN: '华北5（呼和浩特）', value: 'oss-cn-huhehaote' },
        { nameCN: '华北6（乌兰察布）', value: 'oss-cn-wulanchabu' },
        { nameCN: '华南1（深圳）', value: 'oss-cn-shenzhen' },
        { nameCN: '华南2（河源）', value: 'oss-cn-heyuan' },
        { nameCN: '华南3（广州）', value: 'oss-cn-guangzhou' },
        { nameCN: '西南1（成都）', value: 'oss-cn-chengdu' }
      ]
    },
    {
      nameCN: 'AWS',
      value: Provider.aws,
      display: true,
      region: [
        { nameCN: '北京', value: 'cn-north-1' },
        { nameCN: '宁夏', value: 'cn-northwest-1' }
      ]
    },
    {
      nameCN: '七牛云',
      value: Provider.qiniu,
      display: true,
      region: [
        { nameCN: '华东', value: '华东' },
        { nameCN: '华北', value: '华北' },
        { nameCN: '华南', value: '华南' }
      ]
    },
    {
      nameCN: '华为云',
      value: Provider.huaweicloud,
      display: true,
      region: [
        { nameCN: '华北-北京四', value: 'cn-north-4' },
        { nameCN: '华北-北京一', value: 'cn-north-1' },
        { nameCN: '华东-上海二', value: 'cn-east-2' },
        { nameCN: '华东-上海一', value: 'cn-east-3' },
        { nameCN: '华南-广州', value: 'cn-south-1' }
      ]
    },
    {
      nameCN: '腾讯云',
      value: Provider.qcloud,
      display: true,
      region: [
        { nameCN: '北京一区', value: 'ap-beijing-1' },
        { nameCN: '北京', value: 'ap-beijing' },
        { nameCN: '南京', value: 'ap-nanjing' },
        { nameCN: '上海', value: 'ap-shanghai' },
        { nameCN: '广州', value: 'ap-guangzhou' },
        { nameCN: '成都', value: 'ap-chengdu' },
        { nameCN: '重庆', value: 'ap-chongqing' },
        { nameCN: '深圳金融', value: 'ap-shenzhen-fsi' },
        { nameCN: '上海金融', value: 'ap-shanghai-fsi' },
        { nameCN: '北京金融', value: 'ap-beijing-fsi' }
      ]
    }
  ]
};

const regionOversea: IDCAttribute = {
  value: IDC.China,
  provider: [
    {
      nameCN: 'AWS',
      nameEN: 'AWS',
      display: true,
      primary: true,
      value: Provider.aws,
      region: [
        { nameEN: 'US East (Ohio)', value: 'us-east-2' },
        { nameEN: 'US East (N. Virginia)', value: 'us-east-1' },
        { nameEN: 'US West (N. California)', value: 'us-west-1' },
        { nameEN: 'US West (Oregon)', value: 'us-west-2' },
        { nameEN: 'Africa (Cape Town)', value: 'af-south-1' },
        { nameEN: 'Asia Pacific (Hong Kong)', value: 'ap-east-1' },
        { nameEN: 'Asia Pacific (Jakarta)', value: 'ap-southeast-3' },
        { nameEN: 'Asia Pacific (Mumbai)', value: 'ap-south-1' },
        { nameEN: 'Asia Pacific (Osaka)', value: 'ap-northeast-3' },
        { nameEN: 'Asia Pacific (Seoul)', value: 'ap-northeast-2' },
        { nameEN: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
        { nameEN: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
        { nameEN: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
        { nameEN: 'Canada (Central)', value: 'ca-central-1' },
        { nameEN: 'Europe (Frankfurt)', value: 'eu-central-1' },
        { nameEN: 'Europe (Ireland)', value: 'eu-west-1' },
        { nameEN: 'Europe (London)', value: 'eu-west-2' },
        { nameEN: 'Europe (Milan)', value: 'eu-south-1' },
        { nameEN: 'Europe (Paris)', value: 'eu-west-3' },
        { nameEN: 'Europe (Stockholm)', value: 'eu-north-1' },
        { nameEN: 'South America (São Paulo)', value: 'sa-east-1' },
        { nameEN: 'Middle East (Bahrain)', value: 'me-south-1' },
        { nameEN: 'AWS GovCloud (US-East)', value: 'us-gov-east-1' },
        { nameEN: 'AWS GovCloud (US-West)', value: 'us-gov-west-1' }
      ]
    },
    {
      nameCN: '阿里云',
      nameEN: 'Alibaba Cloud',
      value: Provider.aliyun,
      region: [
        { nameCN: '中国（香港）', value: 'oss-cn-hongkong' },
        { nameCN: '美国（硅谷）', value: 'oss-us-west-1' },
        { nameCN: '美国（弗吉尼亚）', value: 'oss-us-east-1' },
        { nameCN: '新加坡', value: 'oss-ap-southeast-1' },
        { nameCN: '澳大利亚（悉尼）', value: 'oss-ap-southeast-2' },
        { nameCN: '马来西亚（吉隆坡）', value: 'oss-ap-southeast-3' },
        { nameCN: '印度尼西亚（雅加达）', value: 'oss-ap-southeast-5' },
        { nameCN: '日本（东京）', value: 'oss-ap-northeast-1' },
        { nameCN: '印度（孟买）', value: 'oss-ap-south-1' },
        { nameCN: '德国（法兰克福）', value: 'oss-eu-central-1' },
        { nameCN: '英国（伦敦）', value: 'oss-eu-west-1' },
        { nameCN: '阿联酋（迪拜）', value: 'oss-me-east-1' },
        { nameCN: '菲律宾（马尼拉）', value: 'oss-ap-southeast-6' },
        { nameCN: '韩国（首尔）', value: 'oss-ap-northeast-2' },
        { nameCN: '泰国（曼谷）', value: 'oss-ap-southeast-7' }
      ]
    }
  ]
};

function createRegionOversea(
  nameCN: string,
  nameEN: string,
  value: IDC,
  primaryProviderValue: Provider,
  primaryRegionsValue: string[]
): IDCAttribute {
  // 因为 .map() 的存在，Object.assign(regionOversea) 深拷贝会失效，所以使用 JSON
  const _regionOversea = JSON.parse(JSON.stringify(regionOversea));
  _regionOversea.nameCN = nameCN;
  _regionOversea.nameEN = nameEN;
  _regionOversea.value = value;
  _regionOversea.provider.map((provider: ProviderAttribute) => {
    provider.primary = provider.value === primaryProviderValue;
    provider.region.map((region: RegionAttribute) => {
      region.primary = primaryRegionsValue.includes(region.value);
    });
    provider.region.sort((a, b) => {
      if (a.primary) return -1;
      if (b.primary) return 1;
    });
  });
  _regionOversea.provider.sort((a, b) => {
    if (a.primary) return -1;
    if (b.primary) return 1;
  });
  return _regionOversea;
}

export const overseaRegionValues: string[] = [];
regionOversea.provider.forEach(provider => {
  provider.region.forEach(region => {
    overseaRegionValues.push(region.value);
  });
});

export const chinaRegionValues: string[] = [];
regionChina.provider.forEach(provider => {
  provider.region.forEach(region => {
    chinaRegionValues.push(region.value);
  });
});

export const regionAmerica: IDCAttribute = createRegionOversea(
  '美国',
  'America',
  IDC.America,
  Provider.aws,
  ['us-west-1', 'oss-us-west-1']
);

export const regionSingapore: IDCAttribute = createRegionOversea(
  '新加坡',
  'Singapore',
  IDC.Singapore,
  Provider.aws,
  ['ap-southeast-1', 'oss-ap-southeast-1']
);

export const regionIndia: IDCAttribute = createRegionOversea(
  '印度',
  'India',
  IDC.India,
  Provider.aws,
  ['ap-south-1', 'oss-ap-south-1']
);

export const regionBritain: IDCAttribute = createRegionOversea(
  '英国',
  'Britain',
  IDC.Britain,
  Provider.aws,
  ['eu-west-2', 'oss-eu-west-1']
);

export const regionMap = {
  [IDC.China]: regionChina,
  [IDC.America]: regionAmerica,
  [IDC.Singapore]: regionSingapore,
  [IDC.India]: regionIndia,
  [IDC.Britain]: regionBritain
};

export const regionToDataCenter = {
  'us': 'us-sv',
  'cn': 'cn-hz',
  'sg': 'sg',
  'in': 'in-mum',
  'uk': 'gb-lon'
};

export const dataCenterToRegion = {};
for (const key in regionToDataCenter) {
  const value = regionToDataCenter[key];
  dataCenterToRegion[value] = key;
}
