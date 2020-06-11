// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  const MAX_LIMIT = 3
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const task = db.collection('tasks')
  var obj = {
      status: _.in([0,1]),//当前正在进行或未领取状态
      type: 1,//设置为其他求助类型
    }
  const res = await task.where(obj).orderBy('loveCount', 'desc')
  .orderBy('time', 'desc')
  .limit(MAX_LIMIT).get()
  // console.log(res.data)
  var arr = res.data
  await db.collection('hot')
  .where({
      type: 1
    }).remove()//清空hot集合
  for(var i in arr){
    // console.log(arr[i])
    db.collection('hot').add({
      // data 字段表示需新增的 JSON 数据
      data: arr[i]
    })
    .then(res => {
      // console.log(res)
    })
  }
  return{
    r: 'ok'
  }
}