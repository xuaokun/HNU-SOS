// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const tasks = db.collection('tasks')
  const wxContext = cloud.getWXContext()
  tasks.add({
    // data 字段表示需新增的 JSON 数据
    data: {
      type: 0,//快递代领任务类型
      _openid: wxContext.OPENID,
      campArea: event.campArea,
      room: event.room,
      sex: event.sex,
      where: event.where,
      endingTime: event.endingTime,
      expressInfo: event.expressInfo,
      size: event.size,
      reward: event.reward,
      rewarddefine: event.rewarddefine,
      status: 0,
      imgList: event.imgList,
      contact: event.contact,
      totalcount: 1,
      personcount: 1,
      time: new Date()
    },
    success: function(res) {
      // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
      console.log(res)
    }
  })
  return{
    r: "success"
  }
}