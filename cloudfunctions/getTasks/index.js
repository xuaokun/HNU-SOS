// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  const MAX_LIMIT = 100
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate
  const task = db.collection('tasks')
  // 先取出集合记录总数
  const countResult = await task.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  var obj;
  // console.log(event.word)
  if(event.type == 0){//快递类型任务
    obj = {
      campArea: event.campArea,
      status: 0,//当前正在进行
      type: event.type,//区分快递带领或者其他求助类型
    }
  }else if(event.word){
    obj = {
      status: _.in([0,1]),//当前正在进行或未领取状态
      type: event.type,//区分快递带领或者其他求助类型
      selfdefine: event.word
    }
  }
  else if(event.sostype == '全部' || event.sostype == '热门'){//其他求助任务全部查询时不指定sostype
    obj = {
      // campArea: event.campArea,
      status: _.in([0,1]),//当前正在进行或未领取状态
      type: event.type,//区分快递带领或者其他求助类型
    }
  }else{
    obj = {
      // campArea: event.campArea,
      status: _.in([0,1]),
      type: event.type,//区分快递带领或者其他求助类型
      sostype: event.sostype == '其他' ? '自定义' : event.sostype
    }
  }
  var sortRule;
  if(event.sostype == '热门'){
    sortRule = {
      loveCount: -1,//按照点赞数降序
      time: -1,//按照时间降序
    }
  }else{
    sortRule = {
      time: -1,//按照时间降序
      loveCount: -1//按照点赞数降序
    }
  }
  for (let i = 0; i < batchTimes; i++) {
    var promise = db.collection('tasks').aggregate().sort(sortRule)
    .skip(i * MAX_LIMIT).limit(MAX_LIMIT).match(obj)
    .lookup({
      from: 'users',
      localField: '_openid',
      foreignField: '_id',
      as: 'user',
    })
    .lookup({
      from: 'comment',
      localField: '_id',
      foreignField: 'taskId',
      as: 'comments',
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
      openid: wxContext.OPENID,
      errMsg: acc.errMsg
    }
  })
}