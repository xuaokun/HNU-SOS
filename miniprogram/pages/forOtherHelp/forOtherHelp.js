// 兼职：
//  
// 拼车：已约车，未约车
//  
// （海甸区）出租：校内，在东门，在南门，在北门，海甸，有空调，有热水，有厨房，可以放电动车/可充电
//  
// （城西区）出租：校内，校外，交通便利，有空调，有热水，，有厨房，可以放电动车/可充电
//  
// （儋州区）出租：校内，校外，交通便利，有空调，有热水，，有厨房，可以放电动车/可充电
//  
// 二手交易：校内，校外，全新，九层新，八层新，七层新，送货上门，上门取件
//  
// 校园拼购:
//  
// 其他：校内办事，校外办事

Page({

  data: {
    time: '12:00',
    campAreaName: ['海甸校区','城西校区','儋州校区'],
    index: 0,
    sosType: ['自定义','拼车','兼职','二手交易','房屋租赁'],
    jobType:['海甸','城西','儋州','校内','校外','家教'],
    carpooling:['海甸','城西','儋州','已约车','未约车','到付','一口价'],
    rent:['海甸','城西','儋州','校内','校外','在东门','在南门','在北门','有空调','有热水','有厨房','可以放电动车/可充电'],
    trading: ['海甸','城西','儋州','校内','校外','全新','九层新','八层新','七层新','送货上门','上门取件'],
    sosTypeIndex: 0,
    tempFilePaths: [],
    userInfo: [],
    contentTip: []
  },
  onLoad(){
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
  },
  bindTimeChange(e){
    this.setData({
      time : e.detail.value
    })
  },
  formReset(e){
    // e.detail.value = '' //自动会清除
    this.setData({
      tempFilePaths: [],
      time: '12:00',
      index: 0,
      sosTypeIndex: 0
    })
  },
  async formSubmit(e){
    var info = e.detail.value
    var that = this;
    console.log(typeof(info.personcount),info.personcount)
    if((info.sostype == 0 && info.selfdefine == '') || info.sostitle == ''
     || info.contact == '' || isNaN(info.personcount)){
         wx.showToast({
           title: '不允许为空或者数据类型有误',
           icon: 'none',
           duration: 2000
         })
         return;
       }
       wx.showToast({
        title: '正在上传...',
        icon: 'loading',
        duration: 5000
      })
    await this.uploadFile();
    wx.cloud.callFunction({
      // 云函数名称
      name: 'submitOtherTasks',
      // 传给云函数的参数
      data: {
        // campArea: parseInt(info.campArea),
        sostype: this.data.sosType[parseInt(info.sostype)],
        selfdefine: info.selfdefine,
        contentTip: this.data.contentTip,
        sostitle: info.sostitle,
        contact: info.contact,
        personcount: parseInt(info.personcount),
        nowcount: 0,
        pricePre: info.pricePre,
        reward: info.reward,
        detail: info.sosdetail,
        imgList: this.data.imgList
      },
      success: function(res) {
        console.log(res.result.r)
        var res = wx.showToast({
          title: '成功',
          icon: 'sunccess',
          duration: 2000,
          success (res) {
            that.formReset()
            wx.switchTab({
              url: '/pages/OtherTasks/OtherTasks',
            })
          }
        })
      },
      fail: console.error
    })
  },
  //校区更改时
  bindCampAreaChange(e){
    this.setData({
      index: e.detail.value
    })
  },
  //类别更改时
  bindSosTypeChange(e){
    this.setData({
      sosTypeIndex: e.detail.value,
      contentTip: []
    })
  },
  //选择图片
  uploadImgHandle(){
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          tempFilePaths : res.tempFilePaths
        })
        //压缩图片质量
        // for(var i in this.data.tempFilePaths){
        //   wx.compressImage({
        //     src: this.data.tempFilePaths[i], // 图片路径
        //     quality: 80 ,// 压缩质量
        //     success: (r) => {
        //       console.log(r)
        //       // 更新tempFilePath为压缩图片地址
        //       this.data.tempFilePaths[i] = r.tempFilePath
        //       this.setData({
        //         tempFilePaths: this.data.tempFilePaths
        //       })
        //       console.log("压缩图片成功",r.tempFilePath)
        //     }
        //   })
        // }
        // console.log(this.data.tempFilePaths)
      },
    })
  },
  //真正上传到云
  async uploadFile(){
    this.data.imgList = []//云端id
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
  //处理内容标签
  handleTip(e){
    console.log(this.data.contentTip)
    var tip = e.currentTarget.dataset.tip
    var index = this.data.contentTip.indexOf(tip)
    // console.log(this.data.contentTip.indexOf(tip))
    if(index > -1){
      this.data.contentTip.splice(index,1)
      this.setData({
        contentTip: this.data.contentTip
      })
      return;
    }
    var len = this.data.contentTip.push(tip)
    this.setData({
      contentTip: this.data.contentTip
    })
  }
})