//update.js
//获取应用实例
var app = getApp();

Page({
  data: {
    date: '',
    today: '',
    inputMoney: '',//修改项金额
    inputTitle: '',//修改项备注
    inputLength: 10,//修改金额位数
    tempUpdateItem: {},//存储当前修改项详情
    arrtypeClass: [],//存储类别选择项
    // arrPayCate: [],
    // tempPayCate: null,
    tempPayClass:'',//存储当前修改类别id
    tempPayClassIindex:0,//存储当前修改类别在类别选项中的位置
    isSubmit: false,//保存按钮点击状态
    isDelete: false//删除按钮点击状态
  },
  bindDateChange: function(e) {//日期改变函数
    this.setData({
      date: e.detail.value
    });
    console.log(this.data.date);
  },
  bindTypeChange: function (e) {//类别改变函数 
     this.setData({
       tempPayClassIindex: e.detail.value,
       tempPayClass: this.data.arrtypeClass[e.detail.value].id
     });
  },
  onLoad: function(option) {
    // Do some initialize when page load.
    // this.setToken();
    console.log('update:','onLoad');   
    console.log('参数', option.tempUpdateItem,'dd', option.temptypeClass) 
    var that = this;
    //获取当前日期
    var nowDate = new Date();
    var nowYear = nowDate.getFullYear();
    var nowMonth = nowDate.getMonth() + 1;
    var nowDay = nowDate.getDate();
    var today = nowYear + '-' + nowMonth + '-' + nowDay;

    this.setData({
      today: today,
      tempUpdateItem: JSON.parse(option.tempUpdateItem),
      tempPayClass: JSON.parse(option.tempUpdateItem).category_id,
      arrtypeClass: JSON.parse(option.temptypeClass)      
    });   
    this.setData({      
      inputMoney: this.data.tempUpdateItem.money / 100,
      inputTitle: this.data.tempUpdateItem.title,
      date: this.data.tempUpdateItem.tallyDate
    });  
    for (var i = 0, len = that.data.arrtypeClass.length; i < len ; i++){
      if (that.data.tempPayClass == that.data.arrtypeClass[i].id){
        this.setData({
          tempPayClassIindex: i
        });
       }        
      }
    console.log('传进的类别id：',that.data.tempPayClass)
  },
  onShow: function (option) {   
    console.log( 'update:','onShow');
    // if (this.data.tempPayClass > 30) {
    //   this.setData({
    //     tempPayCate: '收入'
    //   });
    // } else {
    //   this.setData({
    //     tempPayClass: wx.getStorageSync('tempPayClass')
    //   });
    //   this.setData({
    //     tempPayCate: this.data.arrPayClass[this.data.tempPayClass-8].category
    //   });
    // }
  },
  formSubmit: function(e) {
    var that = this;
    var formData = e.detail.value;
    var dateNow = this.data.date;
    dateNow = this.delimiterConvert(dateNow);
    console.log('dateNow', dateNow);
    formData.tallytime = Date.parse(dateNow)/1000 ;
    formData.type = this.data.tempUpdateItem.type;
    // console.log('formData2', formData);

    formData.category_id = that.data.tempPayClass;

    if(formData.money == ""){
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
    formData.money = Math.abs((formData.money)*1000/10);
    formData.token = wx.getStorageSync('token');
    formData.id = this.data.tempUpdateItem.id;
    console.log('modify:formData3', formData);

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
      url: app.globalData.urlHead + 'tally/modify', //修改账单
      data: formData,  //
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          isSubmit: false
        });
        wx.hideToast();
        console.log(res);
        if (res.data.code == 1000) {
          formData.money = formData.money / 100;
          app.getToken(function () {
            that.formSubmit(e);
          }); 
          wx.showToast({
            title: '修改中，请稍后',
            icon: 'loading',
            duration: 1000
          });
          return false;
        } else if (res.data.code == 0) {
          console.log("修改成功");
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 300
          });
          setTimeout(function () {
            wx.hideToast();
            wx.navigateBack({
              delta: 1
            });
          }, 300);
        }else{
          wx.showToast({
            title: '修改失败',
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function (argument) {
        that.setData({
          isSubmit: false
        });
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
  deleteItem: function () {
    //避免重复点击删除
    var that = this;
    var id = this.data.tempUpdateItem.id;
    var token = wx.getStorageSync('token');
    console.log(id);
    if (this.data.isDelete) {
      return false;
    }
    this.setData({
      isDelete: true
    });
    wx.showToast({
      title: '删除中，请稍后',
      icon: 'loading',
      duration: 10000
    });

    var deleteData = {
      token: token,
      id: id
    };

    wx.request({
      url: app.globalData.urlHead + 'tally/delete', //删除账单
      data: deleteData,  //
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        wx.hideToast();
        console.log(res);
        if (res.data.code == 1000) {
          app.getToken(function () {
            that.deleteItem();
          }); 
          // wx.showToast({
          //   title: '删除中，请稍后',
          //   icon: 'loading',
          //   duration: 1000
          // });
          // return false;
        } else if (res.data.code == 0){
          console.log("删除成功");
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 300
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });           
          }, 300);
        }else{
          wx.showToast({
            title: '删除失败，稍后再试',
            icon: 'loading',
            duration: 1000
          }); 
        }
      },
      fail: function (argument) {
        wx.showToast({
          title: '您的网络有问题，请稍后再试',
          icon: 'loading',
          duration: 1000
        });
      },
      complete: function () {
        that.setData({
          isDelete: false
        });
      }
    });

  },
  onMoneyInput: function (e) {
    var val =  this.clearNoNum(e.detail);

    this.setData({
      inputMoney: val
    });
  },
  clearNoNum: function (obj){
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
