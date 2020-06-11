// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  const MAX_LIMIT = 100
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const task = db.collection('tasks')
  // 先取出集合记录总数
  const countResult = await task.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  console.log(typeof(event.campArea))
  //查询条件区分
  var cond;
  if(event.status != 3){
    cond = {
      _openid: wxContext.OPENID,
      status: event.status
    }
  }else{
    cond = {
      _openid: wxContext.OPENID
    }
  }
  for (let i = 0; i < batchTimes; i++) {
    var promise = db.collection('tasks').aggregate().sort({
      time: -1
  }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).match(cond).lookup({
      from: 'users',
      localField: 'helperopenid',
      foreignField: '_id',
      as: 'user'
    })
    .end()
    // .then(res => console.log(res))
    // .catch(err => console.error(err))
    console.log(promise)
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg
    }
  })
}