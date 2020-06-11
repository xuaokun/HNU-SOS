// miniprogram/pages/forHelp/forHelp.js
Page({

  data: {
    time: '12:00',
    campAreaName: ['海甸校区', '城西校区', '儋州校区'],
    index: 0,
    expressSize: ['小件', '中件', '大件'],
    sizeIndex: 0,
    rewards: ['自定义奖励', '现金奖励'],
    rewardindex: 1,
    tempFilePaths: [],
    userInfo: []
  },
  onShow() {
    var user = wx.getStorageSync('userInfo')
    if (user) {
      this.setData({
        userInfo: user
      })
    }
  },
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
  formReset(e) {
    // e.detail.value = '' //自动会清除
    this.setData({
      tempFilePaths: [],
      time: '12:00',
      index: 0,
      rewardindex: 1
    })
  },
  async formSubmit(e) {
    var info = e.detail.value
    var that = this;
    // console.log(typeof(info.sex))
    if (info.room == '' ||
      info.sex == '' || info.area == '' || info.textarea == '' || info.contact == '' || info.rewarddefine == '') {
      wx.showToast({
        title: '不允许为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.showModal({
      title: '提示',
      content: '任务时效性为您发布消息的当天，过期后系统将自动终止任务哦',
      cancelText: '取消发布',
      confirmText: '继续发布',
      success(res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          that.submit(info)
        } else if (res.cancel) {
          // console.log('用户点击取消')
          return;
        }
      }
    })
  },
  //验证并确认后提交
  async submit(info) {
    wx.requestSubscribeMessage({
      tmplIds: ['BzPhWHrVJsH89X6jxTL5KcnDBSaSlpaMyRcfBenVX5c'],
      success(res) {
        console.log('订阅成功')
      }
    })
    var that = this
    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      duration: 5000
    })
    await this.uploadFile();
    wx.cloud.callFunction({
      // 云函数名称
      name: 'submitTask',
      // 传给云函数的参数
      data: {
        campArea: parseInt(info.campArea),
        room: info.room,
        sex: parseInt(info.sex),
        where: info.area,
        expressInfo: info.textarea,
        size: this.data.expressSize[info.size],
        reward: this.data.rewards[info.reward],
        rewarddefine: info.rewarddefine,
        endingTime: info.time,
        imgList: this.data.imgList,
        contact: info.contact
      },
      success: function (res) {
        var res = wx.showToast({
          title: '成功',
          icon: 'sunccess',
          duration: 2000,
          success(res) {
            that.formReset()
            wx.switchTab({
              url: '/pages/home/home',
            })
          }
        })
      },
      fail: console.error
    })
  },
  //校区更改时
  bindCampAreaChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  //快递大小更改时
  bindSizeChange(e) {
    this.setData({
      sizeIndex: e.detail.value
    })
  },
  //奖励更改时
  bindRewardChange(e) {
    this.setData({
      rewardindex: e.detail.value
    })
  },
  //选择图片
  uploadImgHandle() {
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          tempFilePaths: res.tempFilePaths
        })
      },
    })
  },
  //真正上传到云
  async uploadFile() {
    this.data.imgList = [] //云端id
    // console.log(this.data.tempFilePaths)
    for (let i = 0; i < this.data.tempFilePaths.length; i++) {
      await wx.cloud.uploadFile({
        cloudPath: this.data.userInfo.nickName + (new Date()).valueOf() + '.png',
        filePath: this.data.tempFilePaths[i]
      }).then(res => {
        // console.log(res.fileID)
        this.data.imgList.push(res.fileID)
      })
    }
  },
  //检查textarea字数
  checkStringNum(e) {
    // console.log(e.detail.value)
    if (e.detail.value.length == 140) {
      wx.showToast({
        title: '字数限制140',
      })
    }
  }
})