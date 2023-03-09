export enum CloudTypeMap {
  'MiniApp' = 1,
  'PushStreaming2.0' = 3,
  'CloudRecording' = 7,
  'PushStreaming3.0' = 8,
  'CloudPlayer' = 9,
  'RTMPConverter' = 10,
  'RTMPPusher' = 11,
  'ContentModeration' = 13,
  'MiniAppNew' = 15
}

export const UapExtensionMap = {
  1: 'MiniApp',
  3: 'MediaPush',
  7: 'CloudRecording',
  8: 'MediaPush',
  9: 'CloudPlayer',
  10: 'MediaPush',
  11: 'MediaPush',
  13: 'ContentModeration',
  15: 'MiniApp'
};
