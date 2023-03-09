export enum ExtensionType {
  'SaaS' = 1001,
  'IOT' = 1002,
  'Plugin VideoModifiers' = 10031,
  'Plugin Transcriptions' = 10032,
  'Plugin ContentModeration' = 10034,
  'Plugin Others' = 10033,
  'Component/Plugin' = 1003,
  'Video and Audio Modifiers' = 2001,
  'Tools' = 2002,
  'VideoModifiers' = 2003,
  'AudioModifiers' = 2004,
  'Transcriptions' = 2005,
  'ContentModeration' = 2006,
}

export enum TrialStatus {
  CanNotTrial = 0,
  TrialNotStart = 1,
  UnderTrial = 2,
  ExpireAndNotNotice = 3,
  ExpireAndNoticed = 4,
}

export const I18nTitle = {
  own: 'My extension products',
  all: 'All',
  SaaS: 'SaaS',
  IOT: 'IOT',
  plugin: 'Component/Plugin',
  plugin_videoModifiers: 'Video Modifiers',
  plugin_transcriptions: 'Speech to Text',
  plugin_others: 'Others',
  VideoModifiers: 'Video Modifiers',
  AudioModifiers: 'Audio Modifiers',
  VideoEffects: 'Video Effects',
  AudioEffects: 'Audio Effects',
  Transcriptions: 'Transcriptions',
  ContentModeration: 'Content Moderation',
  plugin_contentModeration: 'Content Moderation',
}

export const XunfeiPackageTypeMapping = {
  '42': 1,
  '43': 2,
  '44': 3,
  '45': 4,
  '46': 5,
}

export enum VendorApplyStatus {
  NotSubmitted = 0,
  ApplySubmitted = 1,
  Approved = 2,
  ApplyRejected = 3,
}

export const bannedExtension = [
  'ACTION',
  'APP',
  'BAT',
  'BIN',
  'CMD',
  'COM',
  'COMMAND',
  'CPL',
  'CSH',
  'EXE',
  'GADGET',
  'INF1',
  'INS',
  'INX',
  'IPA',
  'ISU',
  'JOB',
  'JSE',
  'KSH',
  'LNK',
  'MSC',
  'MSI',
  'MSP',
  'MST',
  'OSX',
  'OUT',
  'PAF',
  'PIF',
  'PRG',
  'PS1',
  'REG',
  'RGS',
  'RUN',
  'SCR',
  'SCT',
  'SHB',
  'SHS',
  'U3P',
  'VB',
  'VBE',
  'VBS',
  'VBSCRIPT',
  'WORKFLOW',
  'WS',
  'WSF',
  'WSH',
]