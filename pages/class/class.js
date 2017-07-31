// pages/class/class.js
var app = 
Page({
  data:{
    arrPayClass: [
      {
        "category": "餐饮饮食",
        "category_id": "8",
        "isSelected": false
      },
      {
        "category": "水果零食",
        "category_id": "9",
        "isSelected":false
      },
      {
        "category": "日常用品",
        "category_id": "10",
        "isSelected":false
      },
      {
        "category": "柴米油盐",
        "category_id": "11",
        "isSelected":false
      },
      {
        "category": "物业水电",
        "category_id": "12",
        "isSelected":false
      },
      {
        "category": "医疗保健",
        "category_id": "13",
        "isSelected":false
      },
      {"category": "交通费",
        "category_id": "14",
        "isSelected":false
      },
      {"category": "话费网费",
        "category_id": "15",
        "isSelected":false
      },
      {"category": "养车费",
        "category_id": "16",
        "isSelected":false
      },
      {"category": "旅行娱乐",
        "category_id": "17",
        "isSelected":false
      },
      {"category": "博彩彩票",
        "category_id": "18",
        "isSelected":false
      },
      {"category": "书报音像",
        "category_id": "19",
        "isSelected":false
      },
      {"category": "数码产品",
        "category_id": "20",
        "isSelected":false
      },
      {"category": "教育培训",
        "category_id": "21",
        "isSelected":false
      },
      {"category": "服饰装扮",
        "category_id": "22",
        "isSelected":false
      },
      {"category": "化妆品美容",
        "category_id": "23",
        "isSelected":false
      },
      {"category": "人际往来",
        "category_id": "24",
        "isSelected":false
      },
      {"category": "礼品礼金",
        "category_id": "25",
        "isSelected":false
      },
      {"category": "孝敬长辈",
        "category_id": "26",
        "isSelected":false
      },
      {"category": "房产车产",
        "category_id": "27",
        "isSelected":false
      },
      {"category": "投资亏损",
        "category_id": "28",
        "isSelected":false
      },
      {"category": "电器家具",
        "category_id": "29",
        "isSelected":false
      },
      {"category": "其它杂项",
        "category_id": "30",
        "isSelected":false
      }
    ]
  },
  tapChoose: function (e) {
    // console.log(e.currentTarget.id);
    var arrPayClass = [];
    for (var i = 0; i < this.data.arrPayClass.length; i++) {
        if (e.currentTarget.id == this.data.arrPayClass[i].category_id) {
            arrPayClass[i] = {
              "category": this.data.arrPayClass[i].category,
              "category_id": this.data.arrPayClass[i].category_id,
              "isSelected": true
            };
            console.log("true");
        } else {
            arrPayClass[i] = {
              "category": this.data.arrPayClass[i].category,
              "category_id": this.data.arrPayClass[i].category_id,
              "isSelected": false
            };
            console.log("false");
        }
    }
    wx.setStorageSync("tempPayClass", e.currentTarget.id);
    console.log(e.currentTarget.id);
    this.setData({
        arrPayClass:arrPayClass
    });

    setTimeout(function () {
      wx.navigateBack({
        delta: 1
      });
    }, 300);
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
});