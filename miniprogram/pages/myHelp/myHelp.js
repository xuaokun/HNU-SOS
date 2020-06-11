var format = require('../common/formatTime.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tasks: [],
    bgdColor: ["lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgreen"],
    currentId: -1
  },
  onLoad(option){
    // console.log(option.status)
    this.setData({
      status: parseInt(option.status)
    })
  },
  onShow(){
    //从数据库获取任务信息
    this.callGetMyHelping();
  },
  //调用云函数获取我的当前任务
  callGetMyHelping(){
    wx.showLoading({
      title: '加载中',
    })
    //云函数中获取任务信息
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getMyHelping',
      // 传给云函数的参数
      data: {
        status: this.data.status
      },
      success: this.getTasksSuccessHandle.bind(this),
      fail: console.error
    })
  },
  //获取正在帮助的数据后
  getTasksSuccessHandle(res){
    // console.log(res.result)
    this.data.tasks = res.result.list
    for(var i in this.data.tasks){
      var date = new Date(this.data.tasks[i].time)
      var formatDate = format.formatTime(date)
      // console.log(formatDate)
      this.data.tasks[i].time = formatDate
    }
    this.setData({
      tasks : this.data.tasks
    })
    wx.hideLoading()
    // console.log(this.data.tasks)
  },
  //查看详情求助
  messageDetailHandle(e){
    //如果已经展开信息则收回
    if(e.currentTarget.dataset.index == this.data.currentId){
      this.setData({
        currentId: -1
      })
      return;
    }
    this.setData({
      currentId: e.currentTarget.dataset.index
    })
  },
    //查看大图
    watchImg(e){
      wx.previewImage({
        current: e.currentTarget.dataset.currentimg, // 当前显示图片的http链接
        urls: e.currentTarget.dataset.imglist // 需要预览的图片http链接列表
      })
    },
})