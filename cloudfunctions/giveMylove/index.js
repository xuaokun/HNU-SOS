// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const task = db.collection('tasks')
  //查询是否已经点赞
  const res = await task.where({
    _id: event.taskid,
    loveList: wxContext.OPENID
  }).get()
  console.log(res.data.length)
  var r = 0;
  //更新数据库，插入点赞列表
  if(res.data.length == 0){
    r = await task.where({
      _id: event.taskid,
    }).update({
      data: {
        loveList: _.push(wxContext.OPENID),
        loveCount: _.inc(1)
      },
      // success: function(res) {
      //   console.log(res.data)
      // }
    })
    r = r.stats.updated
  }


  return {
    r: r//已经点赞返回0，点赞成功返回1
  }
}