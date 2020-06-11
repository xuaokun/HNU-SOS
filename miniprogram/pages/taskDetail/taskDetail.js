var format = require('../common/formatTime.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    task: [],
    time: '',
    taskid: '',
    askOpacity: 0.5,//评论栏透明度
    commentText: ''
  },
  onLoad: function (options) {
    // console.log(Array(options.imgList))
    var array = options.imgList.split(",");
    // console.log(typeof(options.selfdefine))
    // console.log(options.selfdefine)
    this.setData({
      time: options.time, 
      taskid: options.task,
      sostitle:options.sostitle,
      sostype: options.sostype,
      selfdefine: options.selfdefine == 'undefined' ? '': options.selfdefine,
      imgList: array,
      detail: options.detail,
      contact: (options.helperIdList.indexOf(app.globalData.userId) != -1) || (options.openid == app.globalData.userId) ? options.contact : '***',
      personcount: options.personcount,
      reward: options.reward,
      contentTip: options.contentTip,
      pricePre: options.pricePre
    })
    var that = this
    // console.log(options.task)
    const db = wx.cloud.database()
    // var record = db.collection('tasks').doc(options.task).get({
    //   success: function(res){
    //     console.log(res.data)
    //     that.setData({
    //       task: res.data
    //     })
    //     console.log("task",this.data.task)
    //   }
    // })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getComment',
      // 传给云函数的参数
      data: {
        taskid: options.task
      },
      success: this.getCommentSuccessHandle.bind(this),
      fail: console.error
    })
  },
  callGetComment(){},
  getCommentSuccessHandle(res){
    // console.log(res.result.res.list)
    this.data.task = res.result.res.list
    for(var i in this.data.task){
      var date = new Date(this.data.task[i].time)
      var formatDate = format.formatTime(date)
      // console.log(formatDate)
      this.data.task[i].time = formatDate
    }
    this.setData({
      task : this.data.task
    })
    // this.setData({
    //   task: res.result.res.list
    // })
    // console.log(this.data.task[0].taskInfo[0].sostype)
  },
  //提交评论
  formSubmit(e){
    var info = e.detail.value
    if(info.asktext == ''){
      return;
    }
    //检测是否登录
    if(!app.globalData.logged){
      wx.showModal({
        title: '温馨提醒',
        content: '您还没有进行登录操作哦~',
        cancelText: '暂不登录',
        confirmText: '现在登录',
        success(res){
          if(res.confirm){
            wx.navigateTo({
              url: '/pages/first/first',
            })
          }
        }
      })
      return;
    }
    this.callAskFunc(info)
  },
  callAskFunc(info){
    //云函数中获取任务信息
    wx.cloud.callFunction({
      // 云函数名称
      name: 'askAboutDetail',
      // 传给云函数的参数
      data: {
        taskid: this.data.taskid,
        content: info.asktext,
        nickName: app.globalData.user.nickName
      },
      success:this.askSuccessHandle.bind(this),
      fail: console.error
    })
  },
  askSuccessHandle(res){
    wx.showToast({
      title: '评论成功',
      icon:'success',
      duration: 1000
    })
    this.setData({
      commentText: ''
    })
    //重新获取评论
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getComment',
      // 传给云函数的参数
      data: {
        taskid: this.data.taskid
      },
      success: this.getCommentSuccessHandle.bind(this),
      fail: console.error
    })
  },
  changeOpacity(e){
    // console.log(this.data.askOpacity)
    // console.log(e.detail.value)
      if(e.detail.value == ''){
        this.setData({
          askOpacity: 0.5
        })
        return
      }
    if(this.data.askOpacity < 1){
      this.setData({
        askOpacity: 1
      })
    }
  },
  blurChange(e){
    this.setData({
      askOpacity: 0.5
    })
  },
  //查看大图
  watchImg(e){
    wx.previewImage({
      current: e.currentTarget.dataset.currentimg, // 当前显示图片的http链接
      urls: e.currentTarget.dataset.imglist // 需要预览的图片http链接列表
    })
  },
  //copy联系方式
  copyContact(){
    wx.setClipboardData({
      data: this.data.contact,
      success (res) {
        wx.getClipboardData({
          success (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  }
})