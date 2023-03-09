import axios from 'axios'

const http = axios.create({
  baseURL: `${window.location.protocol}//${window.location.host}/api/v2`,
  timeout: 10000,
  responseType: 'json',
})

export async function getProjectNetlessInfo(vendorId: number, onError: Function | undefined = undefined) {
  try {
    const { data } = await http.get(`/project/${vendorId}/netless`)
    return data
  } catch (e) {
    onError ? await onError(e) : console.error(e)
  }
}

export async function listStorage(vendorId: number, onError: Function | undefined = undefined) {
  try {
    const { data } = await http.get(`/project/${vendorId}/netless/storage`)
    return data
  } catch (e) {
    onError ? await onError(e) : console.error(e)
  }
}

export async function saveStorage(vendorId: number, body: any, onError: Function | undefined = undefined) {
  try {
    const { data } = await http.post(`/project/${vendorId}/netless/storage`, {
      ...body,
    })
    return data
  } catch (e) {
    onError ? await onError(e) : console.error(e)
  }
}
