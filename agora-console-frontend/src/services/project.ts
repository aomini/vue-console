import axios from 'axios'

export const project: any = {
  info: {},
}

export const getProjectInfo = async (projectId: string) => {
  const url = `/api/v2/project/${projectId}`
  const ret = await axios.get(url)
  project.info = ret.data
  return project
}

export const updateProject = async (
  projectId: string,
  name: string,
  tokenSwitch: boolean,
  projectStage: number,
  useCaseId: string
) => {
  const url = `/api/v2/project/${projectId}`
  const ret = await axios.put(url, { name, tokenSwitch, projectStage, useCaseId })
  project.info = ret.data
  return project
}

export const updateProjectStatus = async (projectId: string, projectStatus: boolean) => {
  const url = `/api/v2/project/${projectId}/status`
  const ret = await axios.put(url, { projectStatus })
  project.info = ret.data
  return project
}

export const sendCertificateEmail = async (projectId: string) => {
  const url = `/api/v2/project/${projectId}/signkey`
  const ret = await axios.post(url, { projectId })
  project.info = ret.data
  return project
}
