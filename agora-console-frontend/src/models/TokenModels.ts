export enum TokenType {
  Onboarding = 0,
  TempToken = 1,
}

export enum APaaSRole {
  Teacher = 1,
  Student = 2,
  Assistant = 3,
  Audience = 0,
}

export const APaaSRoleOptions = [
  {
    label: 'Teacher',
    value: 1,
  },
  {
    label: 'Student',
    value: 2,
  },
  {
    label: 'Assistant',
    value: 3,
  },
  {
    label: 'Audience',
    value: 0,
  },
]

export interface TokenField {
  name: string
  key: string
  value: string
  type: 'input' | 'select' | 'radio'
}

export interface ProductTokenMetadata {
  product: string
  fields: any
}
