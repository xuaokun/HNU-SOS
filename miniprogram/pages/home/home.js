var format = require('../common/formatTime.js')
var app = getApp()
Page({
  data: {
    campArea: "海甸校区",
    test: "lightblue",
    ads:['cloud://hdxys-u5fzr.6864-hdxys-u5fzr-1302164436/images/ad1.png',
    'cloud://hdxys-u5fzr.6864-hdxys-u5fzr-1302164436/images/ad2.png',
    'cloud://hdxys-u5fzr.6864-hdxys-u5fzr-1302164436/images/ad3.png',
  'cloud://hdxys-u5fzr.6864-hdxys-u5fzr-1302164436/images/ad4.png'],
    bgdColor: ["lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgreen"],
    tasks: [],
    currentTasks:[],//当前展示的任务
    currentPage: 0,//分页的当前页面
    pageSize: 0,//总页面数
    // loadMore: false,//加载更多的文字标签
    loadAll: false, //已经加载完的文字标签
    campArea: 0,
    campAreaName: ['海甸校区','城西校区','儋州校区'],
    openid: ""
  },
  onLoad(){
  },

  //下拉刷新
  onPullDownRefresh(){
    wx.showNavigationBarLoading();
    this.callGetTasks();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onShow(){
    //从数据库获取任务信息
    this.callGetTasks();
    //获取用户自己的openid
    if(this.data.openid == ""){
      this.callLogin();
    }
  },
  //获取用户openid
  callLogin(){
    //云函数中获取任务信息
    wx.cloud.callFunction({
      // 云函数名称
      name: 'login',
      // 传给云函数的参数
      data: {
      },
      success:this.loginSuccessHandle.bind(this),
      fail: console.error
    })
  },
  //处理获取openid
  loginSuccessHandle(res){
    this.setData({
      openid : res.result.openid
    })
    app.globalData.userId = res.result.openid
    // console.log(this.data.openid)
  },
  callGetTasks(){
    //云函数中获取任务信息
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getTasks',
      // 传给云函数的参数
      data: {
        campArea: this.data.campArea,
        type: 0
      },
      success: this.getTasksSuccessHandle.bind(this),
      fail: console.error
    })
  },
    //从数据库获取到数据后
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
        tasks : this.data.tasks,
        pageSize: Math.ceil(this.data.tasks.length / 5),//计算页面数量
        currentTasks: this.data.tasks.slice(0,5),//先展示5条
        currentPage: 1
      })
      this.setData({
        loadAll: (this.data.pageSize <= 1 ? true : false)//数据少于一页时，直接设置已加载完
      })
      // console.log(this.data.tasks)
      // console.log(this.data.pageSize,this.data.loadAll)
    },
  //校区改变时触发该函数
  bindCampAreaChange(e){
    // console.log(typeof(e.detail.value))
    this.setData({
      campArea: parseInt(e.detail.value) 
    })
    this.callGetTasks();
  },
  //帮领函数
  helpFunc(e){
    var item_openid = e.target.dataset.itemopenid
    if(item_openid == this.data.openid){//判断是否为自己发布的任务
      //取消任务函数
      this.cancelTask(e);
      return;
    }
    const r = this.checkInfo(e,1);//先进行帮领人的身份验证,1为尝试帮领状态
    // this.callHelp(e);
  },
  checkInfo(e,status){
    // console.log(status)
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'checkMyInfo',
      // 传给云函数的参数
      data: {
        openid: app.globalData.userId
      },
      success:function(res){
        wx.hideLoading()
        if(res.result.res == 1){
          app.globalData.isStudent = true;
          if(status == 1){
            that.callHelp(e)//调用帮助
          }else if(status == 0){
            wx.navigateTo({
              url: '/pages/forHelp/forHelp',
            })
          }
        }else{
          wx.showModal({
            // cancelText: '取消帮领',
            complete: (res) => {},
            confirmText: '知道啦',
            content: '为保证您和他人的快递安全，发布信息或者帮助他人代取快递需要您为本校学生，您可以联系我们进行授权',
            fail: (res) => {},
            showCancel: false,
            success: (res) => {
              if(res.confirm){
                // wx.navigateTo({
                //   url: '/pages/error/error',
                // })
              }
            },
            title: '提示',
          })
        }
      },
      fail: console.error
    })
  },
  callHelp(e){
    console.log(e);
    var taskId = e.target.dataset.taskid
    // console.log("帮助开始")
    wx.cloud.callFunction({
      // 云函数名称
      name: 'startHelp',
      // 传给云函数的参数
      data: {
        id: taskId
      },
      success: this.startHelpSuccessHandle.bind(this,e),
      fail: console.error
    })
  },
  startHelpSuccessHandle(e,res){
    // console.log(e,res)
    if(res.result.updated == 1){
      //发送订阅消息
      wx.cloud.callFunction({
        // 云函数名称
        name: 'sendSub',
        // 传给云函数的参数
        data: {
          content: e.target.dataset.content,
          openid: e.target.dataset.itemopenid,
          taskId: e.target.dataset.taskid,
        },
        success(res){
          console.log('订阅消息发送成功')
        },
        fail: console.error
      })
      this.callGetTasks();
      wx.showToast({
        title: '已经领取该任务',
        duration: 2000,
        icon: 'success',
        mask: true
      })
    }else{
      wx.showToast({
        title: '已经被人领走啦',
        duration: 2000,
        icon: 'none',
        mask: true,
      })
    }
  },
  //取消任务函数
  async cancelTask(e){
    // console.log(e.target.dataset.imglist)
    var that = this
    const db = wx.cloud.database()
    wx.cloud.deleteFile({
      fileList: e.target.dataset.imglist,
      success: res => {
        // handle success
        console.log(res.fileList,"删除成功")
      },
      fail: console.error
    })
    db.collection('tasks').doc(e.target.dataset.taskid).remove({
      success: function(res) {
        // console.log(res.data)
        that.callGetTasks();
        wx.showToast({
          title: '已经取消该任务',
          duration: 2000,
          icon: 'success',
          mask: true,
        })
      }
    })
  },
  //查看图片
  watchImg(e){
    // console.log(e)
    wx.previewImage({
      current: e.currentTarget.dataset.currentimg, // 当前显示图片的http链接
      urls: e.currentTarget.dataset.imglist // 需要预览的图片http链接列表
    })
  },
  //上拉刷新数据
   onReachBottom(){
    this.data.currentPage++;
    if(this.data.currentPage > this.data.pageSize){
      this.setData({
        loadAll: true,
        currentPage: this.data.pageSize
      })
      // console.log(this.data.currentPage,this.data.pageSize)
      return;
    }
    this.data.currentTasks = this.data.tasks.slice(0,this.data.currentPage * 5);
    this.setData({
      currentTasks: this.data.currentTasks
    })
    console.log("加载新数据")
  },
  //发布按钮的点击函数
  toForHelp(e){
    if(app.globalData.isStudent){
      wx.navigateTo({
        url: '/pages/forHelp/forHelp',
      })
      return;
    }else if(!app.globalData.logged){
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
    this.checkInfo(e,0);//查询数据库是否已经认证为学生,0为尝试发布状态
  },
  //我的接单
  toMyHelping(){
    wx.navigateTo({
      url: '/pages/myHelp/myHelp?status=1',
    })
  }
})