var appInstance = getApp()
Page({
  data: {
    avatarUrl: appInstance.globalData.user.avatarUrl ? appInstance.globalData.user.avatarUrl : 'cloud://hdxys-u5fzr.6864-hdxys-u5fzr-1302164436/images/defaultAvateur.png',
    nickName: appInstance.globalData.user.nickName ? appInstance.globalData.user.nickName : '',
    logged: false,//是否已经登录
  },
  onShow(){
    var user = appInstance.globalData.user;
    // console.log(user)
    if(user.nickName){
      this.setData({
        logged: true,
        avatarUrl: user.avatarUrl,
        nickName: user.nickName
      })
    }
  },
  //我的接单
  toMyHelping(){
    wx.navigateTo({
      url: '/pages/myHelp/myHelp?status=1',
    })
  },
  toMyHelped(){
    wx.navigateTo({
      url: '/pages/myHelp/myHelp?status=2',
    })
  },
  myNotHelpedTasksHandle(){
    wx.navigateTo({
      url: '/pages/myForHelp/myForHelp?status=0',
    })
  },
  myIsHelpingTasksHandle(){
    wx.navigateTo({
      url: '/pages/myForHelp/myForHelp?status=1',
    })
  },
  myHelpedTasksHandle(){
    wx.navigateTo({
      url: '/pages/myForHelp/myForHelp?status=2',
    })
  },
  Toerror(){
    wx.navigateTo({
      url: '/pages/error/error',
    })
  },
  //去登陆页面
  gotoLogin(){
    //进引导页
    wx.navigateTo({
      url: '/pages/first/first',
    })
  }
})