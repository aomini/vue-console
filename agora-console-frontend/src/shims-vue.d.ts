declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.json' {
  const json: { [key: string]: string }
  export default json
}

declare module 'vue-click-outside'
