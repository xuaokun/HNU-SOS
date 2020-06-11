// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const isIn = await db.collection('users').where({
    _id: wxContext.OPENID
  }).get()
  // console.log(isIn.data.length)
  if(isIn.data.length == 0){
    await db.collection('users').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: wxContext.OPENID, //以用户openid作为唯一标识
        userInfo: event.userInfo,
        time: new Date(),
      }
    })
  }
  return {
    add: "ok"
  }
}