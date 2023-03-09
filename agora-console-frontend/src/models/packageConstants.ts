export const MediaTypes = {
  1006: 'Audio Total Duration',
  2016: 'Video Total Duration(HD)',
  10063: 'Video Total Duration(Full HD)',
  10064: 'Video Total Duration(2K)',
  10065: 'Video Total Duration(2K+)',
  1009: 'Cloud Recording Duration Audio Duration',
  2025: 'Cloud Recording Duration Video(HD)',
  10033: 'Cloud Recording Duration Video(Full HD)',
  10034: 'Cloud Recording Duration Video(2K)',
  10035: 'Cloud Recording Duration Video(2K+)',
  20006: 'Music',
  20031: 'MV',
}

export const RtcMedia = [
  { id: 1006, name: 'Audio Total Duration', type: 'RTC' },
  { id: 2016, name: 'Video Total Duration(HD)', type: 'RTC' },
  { id: 10063, name: 'Video Total Duration(Full HD)', type: 'RTC' },
  { id: 10064, name: 'Video Total Duration(2K)', type: 'RTC' },
  { id: 10065, name: 'Video Total Duration(2K+)', type: 'RTC' },
]

export const CloudMedia = [
  { id: 1009, name: 'Cloud Recording Duration Audio Duration', type: 'Cloud Recording' },
  { id: 2025, name: 'Cloud Recording Duration Video(HD)', type: 'Cloud Recording' },
  { id: 10033, name: 'Cloud Recording Duration Video(Full HD)', type: 'Cloud Recording' },
  { id: 10034, name: 'Cloud Recording Duration Video(2K)', type: 'Cloud Recording' },
  { id: 10035, name: 'Cloud Recording Duration Video(2K+)', type: 'Cloud Recording' },
]

export const ContentMedia = [
  { id: 20006, name: 'Music', type: 'Content Center' },
  { id: 20031, name: 'MV', type: 'Content Center' },
]

export const RtcMediaIds = [1006, 2016, 10063, 10064, 10065]
export const CloudMediaIds = [1009, 2025, 10033, 10034, 10035]
export const ContentMediaIds = [20006, 20031]

export enum packageType {
  MinPackage = 3,
  MarketPlace = 2,
  Support = 1,
}

export enum MediaType {
  'Audio Total Duration' = 1006,
  'Video Total Duration(HD)' = 2016,
  'Video Total Duration(Full HD)' = 10063,
}

export enum ProductType {
  RTC = 1,
  CloudRecording = 2,
}
