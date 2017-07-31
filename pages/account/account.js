//account.js
//获取应用实例
var app = getApp();

//获取公共方法
// var util = require('../../utils/util.js');

Page({
  data: {    
    page:1,
    isBottom: false,//账单是否加载完毕
    nomore:false,//加载或没有更多状态显示    
    arrAccount: [],//账单列表
    arrPayCate: [],//存储所有类别项
    otherType:['转账/提现','借入','借出','还入','还出','余额变更','信用卡还款']//存储特殊类别
  },
  //事件处理函数
  gotoUpdate: function(e) {//修改账单函数
    console.log('修改账单当前事件:',e);
    var that = this;    
    var tempUpdateItem = e.currentTarget.dataset.list[e.currentTarget.dataset.index];  
    if (!(tempUpdateItem.type == 'in' || tempUpdateItem.type == 'out')) {
      wx.showToast({
        title: '此项不支持修改',
        icon: 'loading',
        duration: 1000
      });
       return false} ;

    var temptypeClass = [];
    var Intemp = [];//临时存储收入类别
    var Outtemp = [];//临时存储支出类别
    
    for (var i in that.data.arrPayCate) {
      if (that.data.arrPayCate[i].type == "out") {
        Outtemp.push(that.data.arrPayCate[i])
      } else {
        Intemp.push(that.data.arrPayCate[i])
      }
    }
    if (tempUpdateItem.type == 'in'){
      temptypeClass = Intemp;
    } else if (tempUpdateItem.type == 'out'){
      temptypeClass = Outtemp;
    } else{
      temptypeClass = this.data.otherType
    }    
    wx.navigateTo({
      url: '../update/update?tempUpdateItem=' + JSON.stringify(tempUpdateItem) + '&temptypeClass=' + JSON.stringify(temptypeClass)
    });
  },
  onLoad: function (option) {
    console.log('account:','onLoad');
    this.setData({
      arrPayCate: app.globalData.allType,//获取记账页home传递的所有类别参数
    });
    // this.setData({
    //   page: 1,
    //   isBottom: false,
    // });    
  },
  onShow: function (argument) {
    console.log('account:','onShow'); 
    var _this = this;
    this.setData({
      page: 1,
      isBottom: false,
      nomore: false,
    });
      _this.getBillList();
  },
  onReachBottom: function() {
    if (this.data.arrAccount.length == 0) return false;    
    console.log("onReachBottom"); 
    var that = this;
    if (this.data.isBottom) return false;    
    var pageCur = this.data.page;
    pageCur++;
    this.setData({     
      page: pageCur
    });    
    // wx.showToast({
    //   title: '加载中',
    //   icon: 'loading',
    //   duration: 5000
    // });
    wx.request({
      url: app.globalData.urlHead + 'tally/get-history-bill-list', //获取历史记账
      data: {
        token: wx.getStorageSync('token'),
         page: this.data.page
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        console.log('下拉账单列表成功：',res);
        if (res.data.code == 1000) {
          app.getToken(function () {
            pageCur--;
            that.setData({
              isBottom: false,
              page: pageCur
            });
            that.onReachBottom();           
          });           
        } else if (res.data.code == 0){          
          console.log(res.data.data) 
          if (that.getJsonLength(res.data.data) < 10) {
            console.log('没有更多了')
            console.log(res)
            console.log(that.getJsonLength(res.data.data));
            console.log(res.data.data);
            var pageNow = that.data.page;
            console.log(pageNow);
            that.setData({
              isBottom: true,
              page: pageNow,
              nomore:true
            });           
            console.log(that.data.nomore)
            // return false;  
          }          
          // console.log(that.data.page);
          var newList = that.data.arrAccount;
          var getList = res.data.data;
          var newListLen = newList.length; 
          for (var j = 0, len2 = getList.length; j< len2 ; j++){//下拉加载拼接账单列表
            if (getList[j].month === newList[newListLen-1].month){                                
                 for (var f = 0, len4 = getList[j].list.length;f< len4 ; f++ ){                      
                   if (getList[j].list[f].day == newList[newListLen - 1].list[newList[newListLen - 1].list.length-1].day){ 
                       newList[newListLen - 1].list[newList[newListLen - 1].list.length - 1].list=newList[newListLen - 1].list[newList[newListLen - 1].list.length - 1].list.concat(getList[j].list[f].list); 
                      }else{
                     newList[newListLen - 1].list = newList[newListLen - 1].list.concat(getList[j].list[f])                      
                      }                     
                    }             
                }else{
                newList =  newList.concat(getList[j])
                }
              }   
          that.setData({
            arrAccount: newList            
          }); 
        }else{
          wx.showToast({
            title: '加载出错，请稍后再试',
            icon: 'loading',
            duration: 1000
          });  
        }

        wx.hideToast();
      },
      fail:function(res){
        console.log('下拉账单列别加载失败：',res)
        wx.showToast({
          title: '请检查您的网络',
          icon: 'loading',
          duration: 1000
        }); 
      }
    });
  },
  getBillList: function () {//加载账单列表
    var that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000
    });   
    wx.request({
      url: app.globalData.urlHead + 'tally/get-history-bill-list', //获取历史记账
      data: {
        token: wx.getStorageSync('token'),
         page: 1
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        console.log('账单列表第一页成功：',res);              
        if (res.data.code == 1000) {
          app.getToken(function () {
            that.getBillList();            
          });    
        } else if (res.data.code == 0){          
          if (res.data.data == undefined) return false;
          if (that.getJsonLength(res.data.data) < 10) {
            console.log('没有更多数据');
            that.setData({
              arrAccount: [],
              nomore:true
            });            
          }          
          that.setData({
            arrAccount: res.data.data
          });         
            wx.hideToast();                                   
        }else{
          wx.showToast({
            title: '加载出错，请稍后再试',
            icon: 'loading',
            duration: 1000
          });  
        }
      },
      fail:function(res){
        console.log('账单列表第一页失败：',res)
        wx.showToast({
          title: '请检查您的网络',
          icon: 'loading',
          duration: 1000
        }); 
      }
    });
  },
  getJsonLength:function(jsonData){//获取获取账单的条数
    var jsonLength = 0;
    for (var i = 0, len = jsonData.length; i < len ; i++ ){
      for (var j = 0, len2 = jsonData[i].list.length; j < len2 ; j++){        
        jsonLength += jsonData[i].list[j].list.length    
      }
    }
   return jsonLength;
  }
});
