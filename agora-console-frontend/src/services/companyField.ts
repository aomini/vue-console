import axios from 'axios'

export enum CompanyFieldType {
  showVendorCreator = 'showVendorCreator',
  onboarding = 'onboarding',
  viewAA = 'viewAA',
  feedback = 'feedback',
}

export class CompanyExtraSetting {
  public companyField: any = null

  public async getCompanyField(fieldType: string) {
    if (this.companyField) {
      return this.companyField[fieldType]
    }
    const url = `/api/v2/company/field`
    const ret = await axios.get(url)
    this.companyField = ret.data
    return this.companyField[fieldType]
  }

  public async setCompanyField(fieldType: string, value: number | string | boolean) {
    await axios.post(`/api/v2/company/field`, { fieldType: CompanyFieldType.showVendorCreator, value: value })
    this.companyField[fieldType] = value
  }
}

export const companyExtraSetting = new CompanyExtraSetting()
