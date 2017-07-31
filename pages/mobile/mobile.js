// pages/mobile/mobile.js
//获取应用实例
var app = getApp();
Page({
  data:{
    items: [
      {value: 'agree', checked: 'true'}
    ],
    isAgree: 'agree',
    inputNumber: null,
    getIdentifyText: '获取验证码',
    isTapgetIdentify: false,
    count: 60
  },
  checkboxChange:function (e) {
    if (e.detail.value.length !== 0) {
      this.setData({
        isAgree: e.detail.value[0]
      });
    } else {
      this.setData({
        isAgree: false
      });
    }

  },
  getInputNumber:function (e) {
    // console.log(e.detail.value);
    this.setData({
      inputNumber: e.detail.value
    });
  },
  getIdentify: function (e) {
    var that = this;
    var mphone=/^(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/;
    if (!this.data.inputNumber) {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    } else {
        if(!mphone.test(this.data.inputNumber)){
          wx.showToast({
            title: '手机号码格式有误',
            icon: 'loading',
            duration: 1000
          }); 
          return false;
        }

        if (this.data.isTapgetIdentify) {
          return false;
        }

        this.setTime();

        //向后台发出请求，获取短信验证码
        wx.request({
          url: app.globalData.urlHead + 'auth/send-verify-code',   //发送手机验证码
          data: {
             mobile: this.data.inputNumber,
             token: wx.getStorageSync('token')
          },
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
                that.getIdentify(e);
              }); 

              return false;
            } else if (res.data.code == 2002) {
              wx.showToast({
                title: '该手机已绑定其他账号',
                icon: 'loading',
                duration: 1000
              });
              return false;
            } else {
              wx.hideToast();
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
  },
  //事件处理函数
  formSubmit: function (e) {
    console.log(e);
    var that = this;
    var mphone=/^(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/;
    var data = e.detail.value;              //示例{mobileNumber: "13555555555", identify:"123456"}
    var phone = e.detail.value.mobileNumber;
    var identify = e.detail.value.identify;
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请勾选爱记账用户协议',
        icon: 'loading',
        duration: 1000
      });
      return false;
    }
    if(phone == ""){
      wx.showToast({
        title: '请填写手机号码',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    }
    else if(!mphone.test(phone)){
      wx.showToast({
        title: '手机号码格式有误',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    }
    else if(identify == ""){
      wx.showToast({
        title: '请填写验证码',
        icon: 'loading',
        duration: 1000
      }); 
      return false;
    } else {
      wx.showToast({
        title: '提交中',
        icon: 'loading',
        duration: 3000
      });
      wx.request({
        url: app.globalData.urlHead + 'auth/bind-mobile', //绑定手机号码
        data: {
          mobile: phone,
          verifyCode: identify,
          token: wx.getStorageSync('token')
        },      //示例{mobileNumber: "13555555555", identify:"123456"}
        header: {
            'content-type': 'application/json'
        },
        success: function(res) { //示例res {code:0, info:"验证码错误"}  0：成功
          console.log(res);
          console.log(app.globalData.token);
          
          var res = res.data;
          if (res.code == 1000) {
            wx.showToast({
              title: '加载中，请稍后',
              icon: 'loading',
              duration: 1000
            });
            app.getToken(function () {
              that.formSubmit(e);
            });             
          } else if (res.code == 3001) {
            wx.showToast({
              title: '请获取验证码',
              icon: 'loading',
              duration: 1000
            });            
          } else if (res.code == 3002) {
            wx.showToast({
              title: '验证码过期',
              icon: 'loading',
              duration: 1000
            });            
          } else if (res.code == 3003) {
            wx.showToast({
              title: '验证码错误',
              icon: 'loading',
              duration: 1000
            });            
          } else {
            wx.hideToast();
            wx.setStorageSync('mobileNumber', phone); //缓存手机号，供my页面使用
            wx.switchTab({  
              url: '../my/my',  
              success: function (e) {  
                var page = getCurrentPages().pop();  
                if (page == undefined || page == null) return;  
                page.onShow();  
              }  
            });
            // wx.switchTab({
            //   url: '../my/my'
            // });
            // wx.navigateBack({
            //   delta: 2
            // });
          }
        }
      });
    }
  },
  setTime: function () {
    var that = this;
    var count = this.data.count;
    if (this.data.count == 0) {
      this.setData({
        isTapgetIdentify: false,
        getIdentifyText: "重新发送",
        count: 60
      });
      return false;
    } else {
      this.setData({
        isTapgetIdentify: true,
        getIdentifyText: this.data.count +"s",
        count: --count
      });
      console.log(this.data.count);
    }

    setTimeout(function () {
      that.setTime();
    }, 1000);
  }
});