import 'mocha'
import { init as ConfigInit } from './config'
import { getConnection } from 'typeorm';
let fails = []
before(async () => {
  await ConfigInit();
  await getConnection().synchronize();
});

afterEach(async function(){
  const cur = this.currentTest
  if (cur.state === 'failed') {
    fails.push({
      title: cur.title,
      titlePath: cur.titlePath().join('-'),
      duration: cur.duration
    })
  }
})

after(async function() {
  for (const item of fails) {
    console.error(`${item.titlePath} failed`)
  }
  process.exit(fails.length === 0 ? 0 : 1)
})