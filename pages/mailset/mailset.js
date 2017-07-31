// pages/mailset/mailset.js
//获取应用实例
var app = getApp();
Page({
  data:{
    inputMail: ''
  },
  onLoad: function () {
    // body...
    if (wx.getStorageSync('mail')) {
      this.setData({
        inputMail: wx.getStorageSync('mail')
      });
    }
  },
  //事件处理函数
  formSubmit: function (e) {
    console.log(e);
    var that = this;
    var pattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9_-])+/;
    var mail = e.detail.value.mail;

    if(mail == ""){
      wx.showToast({
        title: '请正确填写电子邮箱！',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    }
    // if(mail == wx.getStorageSync('mail')){
    //   wx.showToast({
    //     title: '邮箱无修改',
    //     icon: 'loading',
    //     duration: 1000
    //   }); 
    //   return false;
    // }
    if(!pattern.test(mail)){
      wx.showToast({
        title: '邮箱格式不正确！',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    }

    var formData = {        //示例{mail: "123456@qq.com", password:"123456"}
      mail: mail,
      token: wx.getStorageSync('token')
    };
    console.log('mailset:formData', formData);

    wx.showToast({
        title: '提交中',
        icon: 'loading',
        duration: 3000
    });

    //向后台发出请求，获取邮箱验证码
    wx.request({
      url: app.globalData.urlHead + 'auth/get-mail-verify-code',   //发送邮箱验证码
      data: formData,
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data);
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
            title: '该邮箱已注册',
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
        } else {
          wx.hideToast();
          wx.setStorageSync('newMail', mail); //缓存邮箱，供mailverified页面使用
          wx.navigateTo({
            url: '../mailverified/mailverified'
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