// pages/login/login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    // inputMail: null
  },
  //事件处理函数
  formSubmit: function (e) {
    // console.log(e);
    var that = this;
    var pattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+\.([a-zA-Z0-9_-])+/;
    var mobile = /^(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/;
    var mail = e.detail.value.mail;
    var password = e.detail.value.password;

    if (mail == "") {
      wx.showToast({
        title: '请输入账号',
        icon: 'loading',
        duration: 1000
      });
      return false;
    }
    if (!(pattern.test(mail) || mobile.test(mail))) {
      wx.showToast({
        title: '用户名格式不正确！',
        icon: 'loading',
        duration: 1000
      });
      return false;
    }
    if (password == "") {
      wx.showToast({
        title: '请输入密码',
        icon: 'loading',
        duration: 1000
      });
      return false;
    }

    var formData = {                 //示例{mail: "123456@qq.com", password:"123456", token: "ajz_94c2c9c07bca6bfbae12b0b5b2d738a0"}
      mail: mail,
      password: password,
      token: wx.getStorageSync('token')
    };
    console.log('login:formData', formData);

    wx.showToast({
      title: '提交中',
      icon: 'loading',
      duration: 10000
    });
    wx.request({
      url: app.globalData.urlHead + 'auth/mail-login', //邮箱或手机号登录
      data: formData,      //示例{mail: "123456@qq.com", password:"123456"}
      header: {
        'content-type': 'application/json'
      },
      success: function (res) { //示例res {code:0, info:"验证码错误"}  0：成功
        console.log(res);        
        var res = res.data;
        if (res.code == 1000) {
          wx.showToast({
            title: '加载中，请稍后',
            icon: 'loading',
            duration: 10000
          });
          app.getToken(function () {
            that.formSubmit(e);
          });          
        } else if (res.code == 4001) {
          wx.showToast({
            title: '账号不存在',
            icon: 'loading',
            duration: 1000
          });         
        } else if (res.code == 4002) {
          wx.showToast({
            title: '密码错误',
            icon: 'loading',
            duration: 1000
          });         
        } else if (res.code == 0) {          
          wx.setStorageSync('mobileNumber', res.data.moblie); //缓存手机号，供my页面使用
          wx.setStorageSync('mail', mail);
          wx.hideToast();
          wx.switchTab({  
              url: '../my/my',  
              success: function (e) {  
                var page = getCurrentPages().pop();  
                if (page == undefined || page == null) return;  
                page.onShow();  
              }  
            });
        } else {
          wx.hideToast();
          wx.setStorageSync('mail', mail); //缓存邮箱，供my页面使用
          wx.navigateTo({
            url: '../mobile/mobile'
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
  },
});