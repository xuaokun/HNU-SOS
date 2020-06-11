// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const res = await db.collection('users').where({
    _id: event.openid,
    checked: 1
  }).get()
  // console.log(res.data.length)
  return {
    res: res.data.length
  }
}