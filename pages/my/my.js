// pages/my/my.js
var app = getApp();
Page({
  data: {
    userInfo: null,
    mobileNumber: null,  //"15245464646" or null
    userHideMobile: null,
    mail: null,  //'123456@mail.com' or null
    userHideMail:null
  },
  onLoad: function () {
    console.log('my:onLoad'); 
    this.setData({
      userInfo: wx.getStorageSync("userInfo")
    })  
  },
  onShow: function () {
    console.log('my:onShow');  
    var that = this;
    //调用this.isReg()函数，判断用户是否已注册手机号
    this.isReg(function () {
      that.setMobile();
      that.setMail();
    })
  },  
  isReg: function (cb) {//获取用户mobile mail信息
    var that = this;
    // if (this.data.mobileNumber) {
    //   typeof cb == "function" && cb();
    // } else {
    wx.request({
      url: app.globalData.urlHead + 'user/get-user-info',
      data: {
        token: wx.getStorageSync('token'),
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) { //code=0        
        res = res.data;
        if (res.code == 1000) {
          app.getToken(function () {
            that.isReg(cb);
          });          
        }
        else if (res.code == 0){
          console.log("get-user-info: res.data2", res.data);
          if (res.data.mobile) {
          that.setData({
             mobileNumber: res.data.mobile
            });
           wx.setStorageSync('mobileNumber', res.data.mobile);
          }          
          if (res.data.mail) {
            that.setData({
              mail: res.data.mail
            });
            wx.setStorageSync('mail', res.data.mail);
          }
          cb();
        } else if (res.code != 1002){
          wx.showToast({
            title: '加载失败',
            icon: 'loading',
            duration: 1000
          });    
        }
      },
      fail:function(){
        wx.showToast({
          title: '请检查您的网络',
          icon: 'loading',
          duration: 1000
        }); 
      }
    });
    // }
  },
  //设置页面显示的手机号
  setMobile: function () {
    if (this.data.mobileNumber) {
      console.log(this.data.mobileNumber);
      this.setData({
        userHideMobile: this.hideMobile(this.data.mobileNumber)
      });
    }
  },
  hideMobile: function (str) {
    str = String(str);
    return str.substr(0, 3) + '****' + str.substr(7);
  },
  //设置页面显示的手机号
  setMail: function () {
    if (this.data.mail) {
      console.log(this.data.mail);
      this.setData({
        userHideMail: this.hideMail(this.data.mail)
      });
    }
  },
  hideMail: function (str) {
    str = String(str);
    if (String(str).indexOf('@') > 0) {
      　　　var arr = str.split('@');
      　　　var new_email = arr[0].substr(0, 2) + '****' + '@' + arr[1];
    　　}
    　　return new_email;
  },
  //事件处理函数
  bindNavToLogin: function () {
    wx.navigateTo({
      url: '../login/login'
    });
  },
  bindNavToAccount: function () {
    wx.navigateTo({
      url: '../account/account'
    });
  },
  // bindNavToMail: function () {
  //   wx.navigateTo({
  //     url: '../mailset/mailset'
  //   });
  // },  
});