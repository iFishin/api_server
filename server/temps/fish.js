toastLog('fish.js start');
//启动 Hamibot
launchApp('WiFi魔盒');
//在6秒内找出日志图标的控件
var w = id('action_log').findOne(6000);
//如果找到控件则点击
if (w != null) {
  w.click();
} else {
  //否则提示没有找到
  toast('没有找到日志图标');
}