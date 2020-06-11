// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const task = db.collection('tasks')
  const res = await task.where({
    _id: event.id,
    status: 0
  }).update({
    data: {
      helperopenid: wxContext.OPENID,
      status: 1,
      personcount: 0
    }
  })
  return {
    updated: res.stats.updated
  }
}