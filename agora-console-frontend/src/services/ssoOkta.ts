import axios from 'axios'

export const getSCIMBasicAuthData = async () => {
  const url = `/api/v2/sso/scim/basic-auth`
  const { data } = await axios.get(url)
  return data
}

export const renewSCIMBasicAuthData = async (payload: any) => {
  const url = `/api/v2/sso/scim/basic-auth`
  const { data } = await axios.post(url, payload)
  return data
}

export const getSAMLData = async () => {
  const url = `/api/v2/sso/saml/configuration`
  const { data } = await axios.get(url)
  return data
}

export const updateSAMLData = async (payload: any) => {
  const url = `/api/v2/sso/saml/configuration`
  const { data } = await axios.post(url, payload)
  return data
}

export const removeSAMLData = async (payload: any) => {
  const url = `/api/v2/sso/saml/configuration`
  const { data } = await axios.delete(url, payload)
  return data
}
