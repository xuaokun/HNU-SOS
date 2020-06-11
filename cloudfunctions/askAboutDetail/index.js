// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  var obj;
  if(event.replyTo){
    obj = {
      reply: true,
      replyTo: event.replyTo,
      replyToName: event.replyToName,
      commenter: wxContext.OPENID, 
      taskId: event.taskid,
      content: event.content,
      nickName: event.nickName,
      time: new Date()
    }
  }else{
    obj = {
      reply: false,
      commenter: wxContext.OPENID, 
      taskId: event.taskid,
      content: event.content,
      nickName: event.nickName,
      time: new Date()
    }
  }
  const result = await db.collection('comment').add({
    data: obj,
  })
  
  console.log('创建结果', result)
  return{
    res : result
  }
}