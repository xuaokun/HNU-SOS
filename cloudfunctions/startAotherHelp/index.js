// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const task = db.collection('tasks')
  //先看是否已经领取过该任务了
  var res = await task.where({
    _id: event.taskid,  //任务id
    helperIdList: wxContext.OPENID,//帮助者中已经含有该用户
  }).get()
  console.log(res.data)
  var r = -1;//返回-1表示已经领过任务
  if(res.data.length == 0){
    res = await task.where({
      _id: event.taskid,
      personcount: _.gt(0)//任务剩余量必须大于0
    }).update({
      data: {
        helperIdList: _.push(wxContext.OPENID),
        personcount: _.inc(-1),
        status: 1
      }
    })
    console.log(res)
    r = res.stats.updated //返回0表示任务已经完成，返回1表示任务领取成功
  }

  return {
    r : r
  }
}