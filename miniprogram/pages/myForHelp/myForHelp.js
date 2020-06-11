var format = require('../common/formatTime.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusList: ['待接单','进行中','已完成','全部'],
    tasks: [],
    bgdColor: ["lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgreen"],
    currentId: -1,
    status: -1,
    avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
    nickName: wx.getStorageSync('userInfo').nickName
  },
  onLoad(option){
    // console.log(option.status)
    this.setData({
      status: parseInt(option.status)
    })
  },
  onShow(){
    //从数据库获取任务信息
    this.callGetMyForHelp();
  },
  //调用云函数获取我的当前任务
  callGetMyForHelp(){
    wx.showLoading({
      title: '加载中',
    })
    //云函数中获取任务信息
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getMyForHelp',
      // 传给云函数的参数
      data: {
        status: this.data.status
      },
      success: this.getTasksSuccessHandle.bind(this),
      fail: console.error
    })
  },
  //获取数据后
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
  //确认送达函数
  overSendFunc(e){
    var that = this
    const db = wx.cloud.database()
    db.collection('tasks').doc(e.target.dataset.taskid).update({
      data: {
        status: 2
      },
      success: function(res) {
        // console.log(res.data)
        that.callGetMyForHelp();
        wx.showToast({
          title: '已确认',
          duration: 2000,
          icon: 'success',
          mask: true,
        })
      }
    })
  },
  cancelTask(e){
    var that = this
    const db = wx.cloud.database()
    db.collection('tasks').doc(e.target.dataset.taskid).remove({
      success: function(res) {
        // console.log(res.data)
        that.callGetMyForHelp();
        wx.showToast({
          title: '已经取消该任务',
          duration: 2000,
          icon: 'success',
          mask: true,
        })
      }
    })
  },
  //顶部状态选项函数
  selectStatus(e){
    console.log(e.currentTarget.dataset.status)
    this.setData({
      status: e.currentTarget.dataset.status
    })
    //从数据库获取任务信息
    this.callGetMyForHelp();
  },
  //去求助详情页
  goToDetail(e){
    wx.navigateTo({
      url: '/pages/taskDetail/taskDetail?task=' + e.currentTarget.dataset.item._id +
      '&time=' + e.currentTarget.dataset.item.time+
      '&openid=' + e.currentTarget.dataset.item._openid+
      '&sostitle=' + e.currentTarget.dataset.item.sostitle+
      '&sostype=' + e.currentTarget.dataset.item.sostype+
      '&selfdefine=' + e.currentTarget.dataset.item.selfdefine+
      '&imgList=' + e.currentTarget.dataset.item.imgList+
      '&detail=' + e.currentTarget.dataset.item.detail+
      '&helperIdList=' + e.currentTarget.dataset.item.helperIdList+
      '&contact=' + e.currentTarget.dataset.item.contact+
      '&personcount=' + e.currentTarget.dataset.item.personcount+
      '&reward=' + e.currentTarget.dataset.item.reward,
    })
  }
})