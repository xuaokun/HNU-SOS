var app = getApp()
Page({
  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      console.log(e.detail.userInfo)
      //用户信息存入全局变量
      app.globalData.user = e.detail.userInfo;
      app.globalData.logged = true;
      wx.setStorageSync('userInfo', e.detail.userInfo)//将用户信息存储到本地
      wx.cloud.callFunction({
        // 云函数名称
        name: 'newUser',
        // 传给云函数的参数
        data: {
          userInfo: e.detail.userInfo
        },
        success: function(res) {
          console.log("添加用户返回",res)
          var that = this;
          var res = wx.showToast({
            title: '成功',
            icon: 'sunccess',
            duration: 2000,
            success (res) {
              wx.navigateBack({
              })
            }
          })
        },
        fail: console.error
      })
    }
  }
})