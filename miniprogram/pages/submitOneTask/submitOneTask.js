Page({

  data: {
  },
  toForHelp(){
    wx.navigateTo({
      url: '/pages/forHelp/forHelp',
    })
  },
  toForOtherHelp(){
    wx.navigateTo({
      url: '/pages/forOtherHelp/forOtherHelp',
    })
  }
})