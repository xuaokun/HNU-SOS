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
      type: 1,//其他任务类型
      _openid: wxContext.OPENID,
      // campArea: event.campArea,
      sostype: event.sostype,
      selfdefine: event.selfdefine,
      contentTip: event.contentTip,
      sostitle: event.sostitle,
      contact: event.contact,
      personcount: event.personcount,
      totalcount: event.personcount,
      pricePre: event.pricePre,
      loveCount: 0,
      loveList: [],
      helperIdList: [],
      reward: event.reward,
      detail: event.detail,
      status: 0,
      imgList: event.imgList,
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