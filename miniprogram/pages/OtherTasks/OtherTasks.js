var format = require('../common/formatTime.js')
var app = getApp()
Page({
  data: {
    // campArea: "海甸校区",
    // test: "lightblue",
    bgdColor: ["lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgreen"],
    tasks: [],
    currentTasks:[],//当前展示的任务
    currentPage: 0,//分页的当前页面
    pageSize: 0,//总页面数
    // loadMore: false,//加载更多的文字标签
    loadAll: false, //已经加载完的文字标签
    // campArea: 0,
    // campAreaName: ['海甸校区','城西校区','儋州校区'],
    openid: "",
    userInfo: {},
    sosTypeRange:['全部','热门','拼车','兼职','二手交易','房屋租赁','其他'],
    currentType: 0, //记录当前求助类别,
    showFunctions: false,//展示点赞、评论、接受任务按钮
    writeComment: false,//写评论
    commentTip: "写评论",
    isReplying: false,//是否为回复评论
    hot: []
  },
  onLoad(){
    this.getHot();//获取每日热门
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
    // console.log(this.data.userInfo)
  },
  //获取每日热门
  getHot(){
    var that = this
    const db = wx.cloud.database()
    db.collection('hot').where({
      type: 1
    }).limit(3).get(
      {
        success: function(res) {
          // res.data 包含该记录的数据
          // console.log(res.data)
          that.setData({
            hot: res.data
          })
        }
      }
    )
  },
  //下拉刷新
  onPullDownRefresh(){
    wx.showNavigationBarLoading();
    this.callGetTasks();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  //滑动清除弹窗
  onPageScroll: function() {
    if(this.data.showFunctions){
      this.setData({
        showFunctions: false
      })
    }
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
    // console.log(this.data.openid)
  },
  callGetTasks(w){
    // console.log(w)
    var obj;
    if(w){
      obj = {
        type: 1,
        word: w
      }
    }else{
      obj = {
        // campArea: this.data.campArea,
        type: 1,
        sostype: this.data.sostype
      }
    }
    //云函数中获取任务信息
    wx.cloud.callFunction({
      // 云函数名称
      name: 'getTasks',
      // 传给云函数的参数
      data: obj,
      success: this.getTasksSuccessHandle.bind(this),
      fail: console.error
    })
  },
    //从数据库获取到求助信息后
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
        currentPage: 1,
      })
      this.setData({
        loadAll: (this.data.pageSize <= 1 ? true : false)//数据少于一页时，直接设置已加载完
      })
    },
  //校区改变时触发该函数
  // bindCampAreaChange(e){
  //   // console.log(typeof(e.detail.value))
  //   this.setData({
  //     campArea: parseInt(e.detail.value) 
  //   })
  //   this.callGetTasks();
  // },
  //帮领函数
  helpFunc(e){
    this.callHelp(e);
  },
  callHelp(e){
    // console.log(e.target.dataset.taskid);
    var taskId = e.target.dataset.taskid
    var item_openid = e.target.dataset.itemopenid
    if(item_openid == this.data.openid){
      //取消任务函数
      this.cancelTask(e);
      return;
    }
    // console.log("帮助开始")
    wx.cloud.callFunction({
      // 云函数名称
      name: 'startHelp',
      // 传给云函数的参数
      data: {
        id: taskId
      },
      success: this.startHelpSuccessHandle.bind(this),
      fail: console.error
    })
  },
  startHelpSuccessHandle(res){
    // console.log(res.result.updated == 1)
    if(res.result.updated == 1){
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
  toDetail(e){
    this.setData({
      showFunctions: false
    })
    console.log(e)
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
      '&reward=' + e.currentTarget.dataset.item.reward+
      '&contentTip=' + e.currentTarget.dataset.item.contentTip+
      '&pricePre=' + e.currentTarget.dataset.item.pricePre
    })
  },
  handleType(e){
    var index = e.currentTarget.dataset.index
      this.setData({
        currentType: index,
        sostype: this.data.sosTypeRange[index]
      })
    // console.log(this.data.sostype)
    this.callGetTasks()
  },
  //发布按钮点击函数
  toForOtherHelp(){
    if(app.globalData.isStudent){
      wx.navigateTo({
        url: '/pages/forOtherHelp/forOtherHelp',
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
    this.checkInfo();//查询数据库是否已经认证为学生
  },
//查询数据库验证学生身份
  checkInfo(){
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      isShowLoading: true
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
          wx.navigateTo({
            url: '/pages/forOtherHelp/forOtherHelp',
          })
        }else{
          wx.showModal({
            // cancelText: '取消帮领',
            complete: (res) => {},
            confirmText: '知道啦',
            content: '本小程序只面向校园内部使用，发布信息需要您有本校学生的身份，您可以联系我们进行授权',
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
  showFunction(e){
    // console.log(e.currentTarget.dataset.index)
    if(!this.data.showFunctions){
      this.setData({
        showFunctions: true,
        itemIndex: e.currentTarget.dataset.index,
        taskid: e.currentTarget.dataset.taskid,
      })
    }else{
      this.setData({
        showFunctions: false
      })
    }
  },
  //输入失去焦点触发
  blurChange(){
    this.setData({
      writeComment: false
    })
  },
  //评论功能,通过评论按钮打开
  commentItem(e){
    if(!app.globalData.logged){
      this.setData({
        showFunctions:false
      })
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
    this.setData({
      taskid: e.currentTarget.dataset.taskid,
      showFunctions:false,
      writeComment: true,
      commentTip: '评论...',
      isReplying: false //不是回复，是评论
    })
  },
  //提交评论
  formSubmit(e){
    var info = e.detail.value
    if(info.asktext == ''){
      return;
    }
    this.callAskFunc(info)
  },
  callAskFunc(info){
    //云函数中获取任务信息
    var obj;
    if(this.data.isReplying == true){
      obj = {
        taskid: this.data.taskid,
        content: info.asktext,
        nickName: app.globalData.user.nickName,
        replyTo: this.data.commenterId,
        replyToName: this.data.commenterName
      }
    }else{
      obj = {
        taskid: this.data.taskid,
        content: info.asktext,
        nickName: app.globalData.user.nickName
      }
    }
    wx.cloud.callFunction({
      // 云函数名称
      name: 'askAboutDetail',
      // 传给云函数的参数
      data: obj,
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
      writeComment: false,
      isReplying: false,
      commentTip: '写评论...'
    })
    this.callGetTasks()
  },
  //回复某人的评论
  commentToSomeOne(e){
    this.setData({
      showFunctions: false,
      isReplying: true,
      commenterName: e.currentTarget.dataset.name,
      commentTip: '回复' + e.currentTarget.dataset.name + ':',
      commenterId: e.currentTarget.dataset.who,
      writeComment: true,
      taskid: e.currentTarget.dataset.taskid
    })
  },
  loveItem(e){
    this.setData({
      showFunctions: false
    })
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
    var that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'giveMylove',
      // 传给云函数的参数
      data: {
        taskid: e.currentTarget.dataset.taskid
      },
      success(res){
        // console.log(res.result.r)
        if(res.result.r == 1){
          that.callGetTasks();
        }
      },
      fail: console.error
    })
  },
  //提供帮助函数
  helpItem(e){
    this.setData({
      showFunctions: false
    })
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
    if(e.currentTarget.dataset.taskopenid  == app.globalData.userId){
      wx.showToast({
        title: '不可以领取自己的任务哦',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    var that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'startAotherHelp',
      // 传给云函数的参数
      data: {
        taskid: e.currentTarget.dataset.taskid
      },
      success(res){
        console.log(typeof(res.result.r))
        that.callGetTasks();
        if(res.result.r == 1){
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 1000
          })
        }else if(res.result.r == 0){
          wx.showToast({
            title: '任务已经被领完啦',
            icon: 'none',
            duration: 1000
          })
        }else{
          wx.showToast({
            title: '您已经领取过了哦',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: console.error
    })
  },
  //搜索类别标签
  searchWord(e){
    var info = e.detail.value
    // console.log(info)
    if(info.word == ''){
      return;
    }
    this.callGetTasks(info.word)
  }
})