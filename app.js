//app.js
App({
  //全局变量
  globalData: {
    // userInfo: null,//存储用户信息
    // systemInfo: null,//存储系统信息
    // token: null,//token值
    allType: null,//存储获取的所有类别，用于传给账单详情页
    urlHead: 'https://api.ajzhan.com/api/'//api接口地址
  },
  //监听小程序初始化
  onLaunch: function () {
    console.log("onLaunch");
  },
  //监听小程序显示
  onShow: function () {
    this.getSysteminfo();//调用获取系统信息函数
  },
  //获取token值
  getToken: function (cb) {      
    var that = this;
    wx.login({
      success: function (res) { //{code:"003Bf35p04mjer12ZF4p0CP65p0Bf35n", errMsg:"login:ok"}        
        console.log('微信登录凭证：',res);
        wx.getUserInfo({
          //获取用户信息成功
          withCredentials:true,
          success: function (resU) { //{encryptData:xxxx, encryptedData:xxxx, errMsg:xxxx, iv:xxxx, rawData:JSON字符串, signature:xxxx, userInfo:Object}
            console.log('获取用户信息成功：',resU);
            that.globalData.userInfo = resU.userInfo;
            wx.setStorageSync("userInfo", resU.userInfo);
            wx.request({
              url: that.globalData.urlHead + 'auth/get-token',   //获取最新的会话凭证token
              data: {
                code: res.code,
                userInfo: resU,
                systemInfo: that.globalData.systemInfo,
                isnew: 1,//这里是区分新旧版本标示
              },
              header: {
                'content-type': 'application/json'
              },
              //获取token成功回调
              success: function (resT) { // resT.data {code:0, data: { token: ""ajz_c6696a38dc71ab89e33ce19ac32100b9"" }}
                console.log('获取token成功：',resT);               
                that.globalData.token = resT.data.data.token;
                wx.setStorageSync("token", resT.data.data.token);
                typeof cb == "function" && cb(resT.data.data.token);
              },
              //获取token失败回调
              fail: function (resT) {
                console.log('获取token失败:', resT)
                wx.showToast({
                  title: '获取token失败',
                  icon: 'loading',
                  duration: 1000
                });
              }
            });
          },
          //获取用户信息失败
          fail: function (resF) { // {errMsg:"getUserInfo:cancel"}
            console.log('获取用户信息失败：',resF);
            wx.showToast({
              title: '必须获得用户授权才能使用哦，请卸载后重新安装',
              icon: 'loading',
              duration: 10000
            });
          }
        });
      },
      fail:function(res){
        console.log('获取微信登录凭证失败:',res)
        wx.showToast({
          title: '获取微信登录凭证失败',
          icon: 'loading',
          duration: 1000
        });
      }
    });
  },
  //为my页面获取用户头像及昵称
  getUserInfo: function (cb) {
    if (wx.getStorageSync('userInfo')) {
      this.globalData.userInfo = wx.getStorageSync('userInfo');
    }
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo);
    } else {
      console.log("获取用户信息失败");
    }
  },
  //获取系统信息
  getSysteminfo: function () {
    var that = this;
    if (wx.getStorageSync('systemInfo')) return false;
    wx.getSystemInfo({
      //获取系统信息成功
      success: function (res) {        
        wx.setStorageSync('systemInfo', res);
      },
      //获取系统信息失败
      fail:function(res){        
        wx.showToast({
          title: '获取系统信息失败',
          icon: 'loading',
          duration: 1000
        });
      }
    });
  }
});