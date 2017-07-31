//home.js
//获取应用实例
var app = getApp();

Page({
  data: {
    date: '',
    today: '',
    inputMoney: '',
    inputTitle: '',
    inputLength: 10,
    current_0: true,
    current_1: false,
    totalOut: '0.00',
    totalIn: '0.00',
    headerShow: false,//判断是否显示头部  
    reflow:'',//存储强制重绘样式
    isfocus:false,//金额输入focus判断
    isfocus2: false,//备注输入focus判断    
    tempPayClass: 0,//默认支出类别值    
    arrPayClass: [], //支出类别  
    tempIncomeClass: 0,//默认收入类别值
    arrIncomeClass:[],//收入类别    
    isSubmit: false,    
  },
  onLoad: function () {    
    console.log('home:', 'onLoad');
    var that = this;
    //获取当前日期
    var nowDate = new Date();
    var nowYear = nowDate.getFullYear();
    var nowMonth = nowDate.getMonth() + 1;
    var nowDay = nowDate.getDate();
    var today = nowYear + '-' + nowMonth + '-' + nowDay;
    this.setData({
      date: today,
      today: today
    });
  },
  onShow: function () {
    console.log('home:', 'onShow');  
    this.getTotalMoney();//获取累计数据    
  },
  formSubmit: function (e) {//提交记账记录   
    console.log('账单输入：',e);    
    var that = this;
    var formData = e.detail.value;
    var dateNow = this.data.date;
    dateNow = this.delimiterConvert(dateNow);
    formData.tallytime = Date.parse(dateNow) / 1000;
    formData.type = this.data.current_0 ? "out" : "in";
    console.log('formData2', formData);

    if (this.data.current_0) {
      formData.category_id = this.data.arrPayClass[this.data.tempPayClass].id;
    } else {
      formData.category_id = this.data.arrIncomeClass[this.data.tempIncomeClass].id;
    }
    formData.category_id = String(formData.category_id);

    if (formData.money == "") {
      wx.showToast({
        title: '请输入金额',
        icon: 'loading',
        duration: 1000
      });
      return false;
    } else if (parseFloat(formData.money).toFixed(2) == 0.00) {
      wx.showToast({
        title: '请输入>0金额',
        icon: 'loading',
        duration: 1000
      });
      return false;
    }
    formData.money = Math.abs((formData.money) * 1000 / 10);
    formData.token = wx.getStorageSync('token');
    console.log('formData3', formData);

    // 示例 formData数据格式 {category_id:"9", money:"11234", tallytime:1484755200, title:"备注内容",type:"out"}

    // console.log('form发生了submit事件，携带数据为：', formData);
    //避免重复点击提交
    if (this.data.isSubmit) {
      return false;
    }
    this.setData({
      isSubmit: true
    });
    wx.showToast({
      title: '提交中',
      icon: 'loading',
      duration: 10000
    });
    wx.request({
      url: app.globalData.urlHead + 'tally/add', //记账
      data: formData,  //
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {              
        console.log('记账成功：',res);
        if (res.data.code == 1000) {//token过期执行         
         formData.money = formData.money / 100;//避免重复执行Math.abs((formData.money) * 1000 / 10)导致金额不正确
          wx.showToast({
            title: '加载中，请稍后2',
            icon: 'loading',
            duration: 10000
          }); 
          app.getToken(function (token) {
            that.formSubmit(e);
          });                 
        } else if (res.data.code == 0) {
          that.setData({
            inputMoney: '',
            inputTitle: '',
          });
          that.getTotalMoney(function () {
            console.log("记账成功");
            wx.showToast({
              title: '记账成功',
              icon: 'success',
              duration: 500
            });
          });  
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'loading',
            duration: 1000
          });
        };
      },
      fail: function (res) { 
        console.log('记账失败：',res)       
        wx.showToast({
          title: '您的网络有问题，请稍后再试',
          icon: 'loading',
          duration: 1000
        });
      },
      complete: function () {
        that.setData({
          isSubmit: false
        });
      }
    });
  },
  getTotalMoney: function (cb) {//获取累计数据
    console.log('调用getTotalMoney');
    wx.showToast({
      title: '加载中，请稍后',
      icon: 'loading',
      duration: 10000
    });    
    var that = this; 
    var storagetoken = wx.getStorageSync('token');   
    if (storagetoken){//根据是否已缓存token来执行
      that.getTotalMoneyfun(storagetoken,cb)
    }else{
      app.getToken(function (token) { that.getTotalMoneyfun(token,cb) })
    }  
  },
  getTotalMoneyfun: function (token,cb) {//获取月记账金额函数
    var that = this;
    wx.request({
      url: app.globalData.urlHead + 'tally/get-total-money', //获取本月记账总金额
      data: {
        token: token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {   
        console.log('获取累计金额成功:',res)       
        that.setData({
          isSubmit: false
        });  
        if (res.data.code == 1000) {//token过期状态1000
          app.getToken(function (token) {
            that.getTotalMoney();            
          });                 
        } else if (res.data.code == 0) {//成功获取状态0          
          var totalIn = res.data.data.totalMoneyIn;
          var totalOut = res.data.data.totalMoneyOut;
          that.setData({
            totalOut: (totalOut / 100).toFixed(2),
            totalIn: (totalIn / 100).toFixed(2)
          });
          that.getCategory();//获取类别数据
          wx.hideToast();      
          typeof cb == "function" && cb();                     
        }else{
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function (res) {
        console.log('获取累计金额失败:',res)
        wx.showToast({
          title: '加载失败',
          icon: 'loading',
          duration: 1000
        });          
      }
    });    
  },
  getCategory:function(){//获取类别
   var that = this;
    // wx.showToast({
    //   title: '加载中，请稍后3',
    //   icon: 'loading',
    //   duration: 10000
    // });   
    wx.request({
      url: app.globalData.urlHead + 'tally/get-category', 
      data: {
        token: wx.getStorageSync('token')
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) { 
        console.log('获取类别成功：',res)        
        if (res.data.code == 1000) {//token过期
          app.getToken(function () {
            that.getCategory();
          });
        } else if (res.data.code == 0){          
          var Intemp = [];//临时存储收入类别
          var Outtemp = [];//临时存储支出类别          
          for (var i in res.data.data){
            if (res.data.data[i].type == "out"){
              Outtemp.push(res.data.data[i])    
             }else{
              Intemp.push(res.data.data[i])
             }
          }
          that.setData({            
            arrPayClass: Outtemp,
            arrIncomeClass: Intemp,
          });
          app.globalData.allType = res.data.data
          wx.hideToast();                  
        }else{
          wx.showToast({
            title: '获取类别失败，请重试',
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '获取类别失败',
          icon: 'loading',
          duration: 1000
        });
      }
    });
  },
  bindDateChange: function(e) {//日期改变回调
    this.setData({
      date: e.detail.value
    });
  },
  bindTypeChange:function(e){ //类别改变回调       
    if (e.currentTarget.id == "outpicker"){
      this.setData({
        tempPayClass: Number(e.detail.value)
      }); 
    } else if (e.currentTarget.id == "inpicker"){
      this.setData({
        tempIncomeClass: Number(e.detail.value)
      }); 
    }        
  },
  bindfocusfun:function(){ //金额focus
    var that = this;        
    this.setData({
      headerShow:true,   
      isfocus:true   
    }); 
    setTimeout(function () {//强制引起重绘(在android下input焦点获取后隐藏头部会导致input内的文字产生偏移)
       that.reflow();
    },100)        
  },
  bindblurfun: function () {//金额blur
    var that = this;      
    setTimeout(function(){//为了延时判断是否点击的是备注输入
      if(!that.data.isfocus2){
        that.setData({
          headerShow: false,          
        }); 
      }      
    },0) 
    that.setData({     
      isfocus: false
    });      
  },
  bindfocusfun2: function () {//备注focus 
    var that = this;   
    this.setData({
      headerShow: true,
      isfocus2:true 
    });
    setTimeout(function () {//强制引起重绘(在android下input焦点获取后隐藏头部会导致input内的文字产生偏移)
      that.reflow();
    }, 100)     
  },
  bindblurfun2: function () { //备注blur  
    var that = this;   
    setTimeout(function () {//为了延时判断是否点击的是金额输入
      if (!that.data.isfocus) {
        that.setData({
          headerShow: false,          
        });
      }
    }, 0) 
    that.setData({      
      isfocus2: false
    });     
  },
  reflow:function(){//强制引起重绘方法
    this.setData({
      reflow: this.data.reflow?'':'reflow'     
    });    
  },
  paytap: function (e) {//支出按钮点击
    this.setData({
      current_1:false,
      current_0:true
    });
  },
  incometap: function (e) {//收入按钮
    this.setData({
      current_0:false,
      current_1:true
    });
  },  
  onMoneyInput: function (e) {//金额bindinput
    console.log("输入")
    console.log(e)
    var val =  this.clearNoNum(e.detail);
    this.setData({
      inputMoney: val
    });
  },
  onShareAppMessage: function () {//转发分享设置
    return {
      title: '爱记账',
      desc: '爱记账，永久免费的记账本，记账好轻松~',
      path: ''
    };
  },
  clearNoNum: function (obj){//过滤输入金额
    obj.value = obj.value.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符   
    obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的   
    obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$","."); 

    // obj.value = obj.value.replace(/^(\d\d\d\d\d\d\d).(\d\d)*$/,'$1.$2');//小数点前最多7位 
    obj.value = obj.value.replace(/^(\d{7}).(\d\d)*$/,'$1.$2');//小数点前最多7位 

    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');//只能输入两个小数   

    if(obj.value.indexOf(".")< 0 && obj.value !=""){ //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
      obj.value= parseFloat(obj.value); 
    }
    return obj.value;
  },
  delimiterConvert: function (val){  //格式化数据  
   return val.replace('-','/').replace('-','/');  
  }
});
