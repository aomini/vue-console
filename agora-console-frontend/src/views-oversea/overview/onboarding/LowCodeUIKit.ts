import Vue from 'vue'
import Component from 'vue-class-component'
import '../onboarding/Onboarding.less'
import { user } from '@/services/user'

@Component({
  components: {},
  template: `
    <div class="low-code-box">
      <span>
        The Video UIKit has everything you need to get video calling up and running in minutes by providing a
        customizable, pre-built video UI and automatically handling common RTC logic.
      </span>
      <div>
        <div class="low-code-text">Select a Project:</div>
        <div v-if="!!this.currentProject">
          <el-dropdown placement="bottom-start" trigger="click" @command="setCurrentProject">
            <div class="el-dropdown-link">
              <span class="mr-20"> {{ this.currentProject.name }} </span>
              <span> App ID: {{ this.currentProject.key }} </span>
              <i class="el-icon-arrow-down el-icon--oversea-right"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item, index) in projectList" :key="index" :command="index">
                <span> {{ item.name }} </span>
                <span> {{ 'App ID: ' + item.key }} </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-else>{{ $t('Please create a project first') }}</div>
      </div>
      <div v-if="currentProject && !currentProject.signkey">
        <span>
          Note: Security is not enabled by default on this project to make testing easier. To enable security, please
          update the
        </span>
        <el-button type="text" slot="reference" id="onboarding_create_project" @click="goToProject">
          <span id="onboarding_create_project_row" class="onboarding_create_project_row">{{
            $t('project configuration')
          }}</span> </el-button
        >.
      </div>
      <div>
        <div class="low-code-text">Select Platform:</div>
        <div>
          <el-button
            class="onboarding-row-btn"
            id="select-platform-web"
            :class="currentPlatform === 'web' ? 'is-active' : ''"
            @click="setCurrentPlatform('web')"
          >
            Web
          </el-button>
          <el-button
            class="onboarding-row-btn"
            id="select-platform-android"
            :class="currentPlatform === 'android' ? 'is-active' : ''"
            @click="setCurrentPlatform('android')"
          >
            Android
          </el-button>
          <el-button
            class="onboarding-row-btn"
            id="select-platform-ios"
            :class="currentPlatform === 'ios' ? 'is-active' : ''"
            @click="setCurrentPlatform('ios')"
          >
            iOS
          </el-button>
          <el-button
            class="onboarding-row-btn"
            id="select-platform-macOs"
            :class="currentPlatform === 'macOs' ? 'is-active' : ''"
            @click="setCurrentPlatform('macOs')"
          >
            macOS
          </el-button>
          <el-button
            class="onboarding-row-btn"
            id="select-platform-flutter"
            :class="currentPlatform === 'flutter' ? 'is-active' : ''"
            @click="setCurrentPlatform('flutter')"
          >
            Flutter
          </el-button>
          <el-button
            class="onboarding-row-btn"
            id="select-platform-reactNative"
            :class="currentPlatform === 'reactNative' ? 'is-active' : ''"
            @click="setCurrentPlatform('reactNative')"
          >
            React Native
          </el-button>
        </div>
        <div class="mw-900 mt-10">
          <span
            :id="'onboarding_download_uikit_row_' + currentPlatform"
            class="onboarding_create_project_row link"
            @click="goToDownload"
            >{{ $t('Get the Video UIKit Package') }}</span
          >,<span> and add the following code to your project to get started with Video UI Kits. </span>
          <div class="d-flex">
            <highlight-code :lang="UIKitPlatform[currentPlatform]" class="onboarding-ui-kit">
              {{ getUIKitCode(currentPlatform) }}
            </highlight-code>
            <div v-clipboard:copy="getUIKitCode(currentPlatform)" style="margin-left: -30px; margin-top: 20px">
              <span class="iconfont iconicon-copy row-copy" @click="saveCode()"></span>
            </div>
          </div>
        </div>
        <div>
          <span> Need detailed instructions? </span>
          <el-button
            type="text"
            slot="reference"
            :id="'onboarding_go_to_tutorial_' + currentPlatform"
            @click="goToTutorial"
          >
            <span :id="'onboarding_go_to_tutorial_' + currentPlatform" class="onboarding_create_project_row">{{
              $t('Follow this quickstart guide.')
            }}</span>
          </el-button>
        </div>
      </div>
    </div>
  `,
})
export default class LowCodeUIKit extends Vue {
  projectList: any[] = []
  currentProject: any = null
  currentPlatform: string = 'web'
  UIKitPlatform: any = {
    web: 'javascript',
    android: 'kotlin',
    ios: 'swift',
    macOs: 'swift',
    flutter: 'dart',
    reactNative: 'javascript',
  }
  platformMapping: any = {
    web: 'Web',
    android: 'Android',
    ios: 'iOS',
    macOs: 'macOS',
    flutter: 'Flutter',
    reactNative: 'React Native',
  }
  user = user
  UIKitCode: any = {
    web: `import AgoraUIKit from 'agora-react-uikit';
 
    const App = () => { 
      const rtcProps = {
        appId: 'Replace APP ID', 
        channel: 'test', 
        token: null, // enter your channel token as a string 
      }; 
      return (
        <AgoraUIKit rtcProps={rtcProps} /> 
      ) 
    };
    
    export default App; `,
    android: `import io.agora.agorauikit_android.*; 

    val agView = AgoraVideoViewer(this, AgoraConnectionData("Replace APP ID")) 
    
    // Fill the MainActivity with this view 
    this.addContentView( 
     agView, 
     FrameLayout.LayoutParams( 
       FrameLayout.LayoutParams.MATCH_PARENT, 
       FrameLayout.LayoutParams.MATCH_PARENT 
     ) 
    ) 
     
    // Join channel "test" 
    agView.join("test", role=Constants.CLIENT_ROLE_BROADCASTER) `,
    ios: `import AgoraUIKit 

    let agoraView = AgoraVideoViewer( 
      connectionData: AgoraConnectionData( 
        appId: "Replace APP ID", 
        rtcToken: <#"agora-rtc-token"#>, // rtc token or nil 
        rtmToken: <#"agora-rtm-token"#> // rtm token or nil 
      ) 
    ) 
    
    // Fill the current view controller with the Agora UIKit View 
    agoraView.fills(view: self.view) 
    
    // Join channel "test" 
    agoraView.join(channel: "test", as: .broadcaster) `,
    macOs: `import AgoraUIKit 

    let agoraView = AgoraVideoViewer( 
      connectionData: AgoraConnectionData( 
        appId: "Replace APP ID", 
        rtcToken: <#"agora-rtc-token"#>, // rtc token or nil 
        rtmToken: <#"agora-rtm-token"#> // rtm token or nil 
      ) 
    ) 
    
    // Fill the current view controller with the Agora UIKit View 
    agoraView.fills(view: self.view) 
    
    // Join channel "test" 
    agoraView.join(channel: "test", as: .broadcaster) `,
    flutter: `import 'package:agora_uikit/agora_uikit.dart'; 

    final AgoraClient client = AgoraClient( 
     agoraConnectionData: AgoraConnectionData( 
       appId: "Replace APP ID", 
       channelName: "test", 
       tempToken: token, 
     ), 
     enabledPermission: [ 
      Permission.camera, 
      Permission.microphone, 
     ], 
    ); 
    
    @override 
    void initState() { 
     super.initState(); 
     initAgora(); 
    } 
    
    void initAgora() async { 
     await client.initialize(); 
    } 
    
    @override 
    Widget build(BuildContext context) { 
     return MaterialApp( 
        home: Scaffold( 
          body: SafeArea( 
            child: Stack( 
              children: [ 
                AgoraVideoViewer(client: client),  
                AgoraVideoButtons(client: client), 
              ], 
            ), 
          ), 
        ), 
      ); 
    } `,
    reactNative: `import AgoraUIKit from 'agora-rn-uikit';

      const App = () => {
        const connectionData = {
          appId: 'Replace APP ID',
          channel: 'test',
          token: null, // enter your channel token as a string 
         };
        return(
          <AgoraUIKit connectionData={connectionData} />
         )
      }

      export default App; `,
  }

  async init() {
    const ret = await this.$http.get('/api/v2/projects')
    this.projectList = ret.data.items
    if (this.projectList.length > 0) this.currentProject = this.projectList[0]
  }

  async mounted() {
    await this.init()
    this.initPlatform()
  }

  initPlatform() {
    if (this.user.info.extrasInfo) {
      const extrasInfo = JSON.parse(user.info.extrasInfo)
      if (extrasInfo.platformCheckedMap) {
        for (const platform of Object.keys(this.UIKitPlatform)) {
          if (extrasInfo.platformCheckedMap[this.platformMapping[platform]]) {
            this.currentPlatform = platform
            return
          }
        }
      }
    }
  }

  setCurrentProject(key: any) {
    this.currentProject = this.projectList[key]
    this.getUIKitCode(this.currentPlatform)
  }

  setCurrentPlatform(platform: string) {
    this.currentPlatform = platform
    this.getUIKitCode(platform)
  }

  getUIKitCode(platform: string) {
    const replacedString = this.currentProject ? this.currentProject.key : 'Your App ID'
    return this.UIKitCode[platform].replace('Replace APP ID', replacedString)
  }

  goToProject() {
    this.$router.push({ name: 'editProject', params: { id: this.currentProject.projectId } })
  }

  goToDownload() {
    const downloadLinkMap: any = {
      web: 'https://www.npmjs.com/package/agora-react-uikit',
      android: 'https://jitpack.io/#AgoraIO-Community/VideoUIKit-Android',
      ios: 'https://swiftpackageindex.com/AgoraIO-Community/VideoUIKit-iOS',
      macOs: 'https://swiftpackageindex.com/AgoraIO-Community/VideoUIKit-macOS',
      flutter: 'https://pub.dev/packages/agora_uikit',
      reactNative: 'https://www.npmjs.com/package/agora-rn-uikit',
    }

    window.open(downloadLinkMap[this.currentPlatform])
  }

  goToTutorial() {
    const tutorialMap: any = {
      web: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit?platform=web',
      android: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit?platform=android',
      ios: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit?platform=ios',
      macOs: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit?platform=macos',
      flutter: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit?platform=flutter',
      reactNative: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit?platform=react-native',
    }

    window.open(tutorialMap[this.currentPlatform])
  }

  saveCode() {
    this.$message.success(this.$t('Copied') as string)
  }
}
