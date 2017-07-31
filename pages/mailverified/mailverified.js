// pages/mailverified/mailverified.js
//获取应用实例
var app = getApp();
Page({
  data:{
    mail: null
  },
  onLoad: function () {
    // body...
  },
  onShow: function () {
    // body...
    this.setData({
      mail: wx.getStorageSync('newMail')
    });
  },
  //事件处理函数
  formSubmit: function (e) {
    console.log(e);
    var that = this;
    var verifycode = e.detail.value.verifycode;
    var mail = this.data.mail;

    if(verifycode == ""){
      wx.showToast({
        title: '请输入验证码',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    }

    var formData = {        //示例{verifycode:"123456"}
      mail: mail,
      verifycode: verifycode,
      token: app.globalData.token
    };
    console.log('mailverified:formData', formData);

    wx.showToast({
        title: '提交中',
        icon: 'loading',
        duration: 3000
    });

    //向后台发出请求，验证邮箱验证码
    wx.request({
      url: app.globalData.urlHead + 'auth/check-mail-verify-code',   //验证邮箱验证码
      data: formData,
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        console.log('验证邮箱'+ res.data);
        if (res.data.code == 1000) {
          wx.showToast({
            title: '加载中，请稍后',
            icon: 'loading',
            duration: 1000
          });
          app.getToken(function () {
            that.formSubmit();
          }); 
          return false;
        } else if (res.data.code == 4001) {
          wx.showToast({
            title: '验证码错误',
            icon: 'loading',
            duration: 1000
          });
          return false;
        } else if (res.data.code == 4002) {
          wx.showToast({
            title: '系统异常，请稍后再试',
            icon: 'loading',
            duration: 1000
          });
          return false;
        } else if (res.data.code == 0) {
          wx.hideToast();
          // wx.switchTab({  
          //   url: '../my/my',  
          //   success: function (e) {  
          //     var page = getCurrentPages().pop();  
          //     if (page == undefined || page == null) return;  
          //     page.onShow();  
          //   }  
          // });
          wx.navigateBack({
            delta: 2
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '您的网络有问题，请稍后再试',
          icon: 'loading',
          duration: 1000
        });
      }
    });
  }
});