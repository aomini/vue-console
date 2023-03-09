interface PlatformModel {
  name: string
  value: string
}

export interface ProductModel {
  name: string
  platformList: PlatformModel[]
}

export interface OnboardingProjectModel {
  projectId?: string
  name: string
  useCase?: ProjectUseCaseModel
  appId?: string
  appCertificate?: string
  isEditing: boolean
  tokenSwitch?: number
}

export interface ProjectUseCaseModel {
  internalIndustryId: string
  useCaseId: string
  useCaseData: any
}

// Todo(SUN): 海外 product 配置可迁移至 console-admin
export const ProductList: ProductModel[] = [
  {
    name: 'Basic Video Call',
    platformList: [
      {
        name: 'Android',
        value: 'https://www.agora.io/en/blog/1-to-1-video-chat-app-on-android-using-agora/',
      },
      {
        name: 'iOS',
        value: 'https://www.agora.io/en/blog/building-a-one-to-many-ios-video-app-with-agora/',
      },
      {
        name: 'macOS',
        value: 'https://docs.agora.io/en/Video/start_call_mac?platform=macOS',
      },
      {
        name: 'Windows',
        value: 'https://docs.agora.io/en/Video/start_call_windows?platform=Windows',
      },
      {
        name: 'Web',
        value: 'https://www.agora.io/en/blog/add-video-calling-in-your-web-app-using-the-agora-web-ng-sdk/',
      },
      {
        name: 'Flutter',
        value: 'https://www.agora.io/en/blog/group-video-calling-using-the-agora-flutter-sdk/',
      },
      {
        name: 'Electron',
        value: 'https://docs.agora.io/en/Video/start_call_electron?platform=Electron',
      },
      {
        name: 'React Native',
        value: 'https://www.agora.io/en/blog/how-to-build-a-react-native-video-calling-app-using-agora/',
      },
      {
        name: 'Unity',
        value: 'https://www.agora.io/en/blog/how-to-embed-group-video-chat-in-your-unity-games/',
      },
    ],
  },
  {
    name: 'Live Interactive Audio Streaming',
    platformList: [
      {
        name: 'Android',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_audio_android?platform=Android',
      },
      {
        name: 'iOS',
        value: 'https://www.agora.io/en/blog/creating-live-audio-chat-rooms-with-swiftui/',
      },
      {
        name: 'macOS',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_audio_mac?platform=macOS',
      },
      {
        name: 'Windows',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_audio_windows?platform=Windows',
      },
      {
        name: 'Web',
        value: 'https://docs.agora.io/en/Interactive%20Broadcast/start_live_audio_web?platform=Web',
      },
      {
        name: 'Flutter',
        value:
          'https://www.agora.io/en/blog/building-your-own-audio-streaming-application-using-the-agora-flutter-sdk/',
      },
      {
        name: 'Electron',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_audio_electron?platform=Electron',
      },
      {
        name: 'React Native',
        value: 'https://www.agora.io/en/blog/building-a-live-audio-streaming-react-native-app-with-agora/',
      },
      {
        name: 'Unity',
        value: 'https://www.agora.io/en/blog/audio-party-chat-streaming-in-unity-using-agora/',
      },
    ],
  },
  {
    name: 'Live Interactive Video Streaming',
    platformList: [
      {
        name: 'Android',
        value: ' https://www.agora.io/en/blog/add-live-streaming-to-your-android-app-using-agora/',
      },
      {
        name: 'iOS',
        value: 'https://www.agora.io/en/blog/how-to-build-a-live-video-streaming-ios-app-with-agora/',
      },
      {
        name: 'macOS',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_mac?platform=macOS',
      },
      {
        name: 'Windows',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_windows?platform=Windows',
      },
      {
        name: 'Web',
        value: 'https://www.agora.io/en/blog/how-to-build-a-live-broadcasting-web-app/',
      },
      {
        name: 'Flutter',
        value: 'https://www.agora.io/en/blog/adding-live-interactive-video-streaming-using-the-agora-flutter-sdk/',
      },
      {
        name: 'Electron',
        value: 'https://docs.agora.io/en/live-streaming/start_live_electron?platform=Electron',
      },
      {
        name: 'React Native',
        value: 'https://docs.agora.io/en/Interactive%2520Broadcast/start_live_react_native?platform=React%2520Native',
      },
      {
        name: 'Unity',
        value: 'https://docs.agora.io/en/Interactive%20Broadcast/start_live_unity?platform=Unity',
      },
    ],
  },
]
