import _ from 'lodash'
import devConfig from './development'
import stagingConfig from './staging'
import prodConfig from './production'
import preprodConfig from './preprod'

const devHosts = ['localhost:3088']

const devAAHosts = ['localhost:7789']

const stagingHosts = ['console-staging.agora.io', 'console.staging.agora.io']

const stagingCustomRegex = /^console-\w{2,4}.staging.agora.io$/

const preprodHosts = ['console-preprod.agora.io', 'console-preprod-2.agora.io']

const prodHosts = ['console.agora.io']

const originHost = location.host
let config = prodConfig

if (devHosts.indexOf(originHost) >= 0) {
  config = devConfig
} else if (stagingHosts.indexOf(originHost) >= 0 || !!originHost.match(stagingCustomRegex)) {
  config = stagingConfig
} else if (preprodHosts.indexOf(originHost) >= 0) {
  config = preprodConfig
}

export default {
  config,
  validHosts: _.concat(devHosts, devAAHosts, stagingHosts, preprodHosts, prodHosts),
}
