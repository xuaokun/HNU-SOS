const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  try {
    const user = await db.collection('users').where({
      _id: wxContext.OPENID //调用者id
    }).get()
    // console.log(user.data[0].phoneNumber)
    const result = await cloud.openapi.subscribeMessage.send({
        touser: event.openid,
        page: '/pages/myForHelp/myForHelp?status=1',
        lang: 'zh_CN',
        data: {
          thing1: {//订单内容
            value: event.content
          },
          phrase2: {//订单状态
            value: '已接单'
          },
          character_string6: {//订单编号
            value: event.taskId
          },
          phone_number11: {//配送员电话
            value: user.data[0].phoneNumber
          }
        },
        templateId: 'BzPhWHrVJsH89X6jxTL5KcnDBSaSlpaMyRcfBenVX5c',
        miniprogramState: 'formal'
      })
    return result
  } catch (err) {
    return err
  }
}