function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function getDate(second) {
    var date = new Date(second*1000);
    return [date.getFullYear(),date.getMonth() + 1,date.getDate()].map(formatNumber).join('-');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

//根据日期排序历史账单列表
function sortBillList(billList) {
    var newList = [];
    billList.forEach(function (element) {
        var newItem = {};
        newItem['list'] = [];
        newItem['date'] = getDate(element.tallytime);
        var newSubItem = {
            type: element.type,
            category_id: element.category_id,
            money: element.money,
            title: element.title
        };
        
        newItem['list'].push(newSubItem);
        newList.push(newItem);
    });
    return newList;
}

module.exports = {
    formatTime: formatTime,
    sortBillList: sortBillList
}

