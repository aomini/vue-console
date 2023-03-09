import axios from 'axios'
import { CloudTypeMap } from '@/models/uapModels'

const apaasApi = (projectId: string): string => `/api/v2/project/${projectId}/apaas`
const netlessApi = (vendorId: string): string => `/api/v2/project/${vendorId}/netless`
const netlessTokenApi = (vendorId: string): string => `/api/v2/project/${vendorId}/netless/token`
const uapApi = (): string => `/api/v2/usage/uap/setting`

export const getApaasConfiguration = async (projectId: string) => (await axios.get(apaasApi(projectId))).data
export const updateApaasConfiguration = async (projectId: string, data: any) =>
  (await axios.put(apaasApi(projectId), data)).data

export const getNetlessConfiguration = async (venderId: string) => (await axios.get(netlessApi(venderId))).data
export const updateNetlessToken = async (venderId: string, data: any) =>
  (await axios.post(netlessTokenApi(venderId), data)).data

export const enableCloudPlayer = async (venderId: string, region: '1' | '2') =>
  (
    await axios.post(uapApi(), {
      vids: venderId,
      typeId: CloudTypeMap.CloudRecording,
      region: region,
    })
  ).data

export const enableMiniApp = async (venderId: string, region: '1' | '2') =>
  (
    await axios.post(uapApi(), {
      vids: venderId,
      typeId: CloudTypeMap.MiniAppNew,
      region: region,
    })
  ).data
