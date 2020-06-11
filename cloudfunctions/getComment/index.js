// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db =cloud.database()
  const comment = db.collection('comment')
  const res = await comment.aggregate().sort({
    time: -1
}).limit(100).match({
  taskId: event.taskid
})
.lookup({
  from: 'users',
  localField: 'commenter',
  foreignField: '_id',
  as: 'userInfo',
})
.lookup({
  from: 'tasks',
  localField: 'taskId',
  foreignField: '_id',
  as: 'taskInfo',
})
.end()
  return {
    res: res
  }
}