// 启动eg: npm run updateVendorInfoStage '/Users/hd/Downloads/vendor.xlsx'
import xlsx from 'node-xlsx';
const filePath = process.argv[2];

if (!filePath) {
  console.error(`Need Xlsx File Path Param! eg: npm run updateVendorInfoStage '/Users/hd/Downloads/vendor.xlsx'`);
  process.exit();
}
function main() {
  const liveList = [];
  const testingList = [];
  const res = xlsx.parse(filePath);
  if (Array.isArray(res) && res.length > 0) {
    // 去掉第一行的标题（vid----状态）
    const data = res[0].data.slice(1);
    data.map(item => {
      if (item[1] === '上线') {
        liveList.push(item[0]);
      } else if (item[1] === '测试中') {
        testingList.push(item[0]);
      }
    });
    console.log('liveList', liveList.join(','));
    console.log('testingList', testingList.join(','));
  }
  process.exit();
}

main();
