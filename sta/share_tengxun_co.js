(function() {
  var wxapi = "//res.wx.qq.com/open/js/jweixin-1.0.0.js", qqapi = "//open.mobile.qq.com/sdk/qqapi.js?_bid=152", qzapi = "//qzonestyle.gtimg.cn/qzone/phone/m/v4/widget/mobile/jsbridge.js?_bid=339";
  var require;
  function _require(url, onload) {
    var doc = document;
    var head = doc.head || (doc.getElementsByTagName("head")[0] || doc.documentElement);
    var node = doc.createElement("script");
    node.onload = onload;
    node.onerror = function() {
    };
    node.async = true;
    node.src = url[0];
    head.appendChild(node);
  }
  function _initWX(data) {
    if (!data.WXconfig) {
      return;
    }
    require([wxapi], function(wx) {
      if (!wx.config) {
        wx = window.wx;
      }
      var conf = data.WXconfig;
      wx.config({debug:false, appId:conf.appId, timestamp:conf.timestamp, nonceStr:conf.nonceStr, signature:conf.signature, jsApiList:["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"]});
      wx.error(function(res) {
        alert("微信分享配置错误");
      });
      wx.closeWindow();
      wx.getLocation({
          type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res) {
              var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
              var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
              var speed = res.speed; // 速度，以米/每秒计
              var accuracy = res.accuracy; // 位置精度
              alert("getLocation");
          }
      });
      wx.ready(function() {
        alert("ready")
        var config = {title:data.title, desc:data.summary, link:data.url, imgUrl:data.pic, type:"", dataUrl:"", success:function() {
          data.callback && data.callback();
        }, cancel:function() {
        }};
        wx.onMenuShareAppMessage(config);
        wx.onMenuShareQQ(config);
        wx.onMenuShareQZone(config);
        if (conf.swapTitleInWX) {
          wx.onMenuShareTimeline({title:data.summary, desc:data.title, link:data.url, imgUrl:data.pic, type:"", dataUrl:"", success:function() {
            data.callback && data.callback();
          }, cancel:function() {
          }});
        } else {
          wx.onMenuShareTimeline(config);
        }
      });
    });
  }
  function _initQQ(data) {
    var info = {title:data.title, desc:data.summary, share_url:data.url, image_url:data.pic};
    function doQQShare() {
      try {
        if (data.callback) {
          // 从文档中只有setOnShareHandler能有分享成功回调，但实际用不了，连基本的分享标图片链接都不行
          // window.mqq.ui.setOnShareHandler(function(type) {
          //   if (type == 3 && (data.swapTitle || data.WXconfig && data.WXconfig.swapTitleInWX)) {
          //     info.title = data.summary;
          //   } else {
          //     info.title = data.title;
          //   }
          //   info.share_type = type;
          //   info.back = true;
          //   window.mqq.ui.shareMessage(info, function(result) {
          //     if (result.retCode === 0) {
          //       data.callback && data.callback.call(this, result);
          //     }
          //   });
          // });
          // mqq.data.setShareInfo(info, callback)中的callback属于设置完成回调，而不是用户触发分享后的成功回调
          window.mqq.data.setShareInfo(info);
        } else {
          window.mqq.data.setShareInfo(info);
        }
        if(data.judgeLoginFunc) {
            window.mqq.ui.setTitleButtons({
                right: {
                    callback: function () {
                        data.judgeLoginFunc && data.judgeLoginFunc.call(this);
                        mqq.ui.showShareMenu();
                    }
                }
            })
        }
      } catch (e) {
      }
    }
    if (window.mqq) {
      doQQShare();
    } else {
      require([qqapi], function() {
        doQQShare();
      });
    }
  }
  function _initQZ(data) {
    function doQZShare() {
      if (QZAppExternal && QZAppExternal.setShare) {
        var imageArr = [], titleArr = [], summaryArr = [], shareURLArr = [];
        for (var i = 0;i < 5;i++) {
          imageArr.push(data.pic);
          shareURLArr.push(data.url);
          if (i === 4 && (data.swapTitle || data.WXconfig && data.WXconfig.swapTitleInWX)) {
            titleArr.push(data.summary);
            summaryArr.push(data.title);
          } else {
            titleArr.push(data.title);
            summaryArr.push(data.summary);
          }
        }
        QZAppExternal.setShare(function(data) {
        }, {"type":"share", "image":imageArr, "title":titleArr, "summary":summaryArr, "shareURL":shareURLArr});
      }
    }
    if (window.QZAppExternal) {
      doQZShare();
    } else {
      require([qzapi], function() {
        doQZShare();
      });
    }
  }
  function init(opts) {
    var ua = navigator.userAgent;
    var isWX = ua.match(/MicroMessenger\/([\d\.]+)/), isQQ = ua.match(/QQ\/([\d\.]+)/), isQZ = ua.indexOf("Qzone/") !== -1;
    isWX && _initWX(opts);
    isQQ && _initQQ(opts);
    isQZ && _initQZ(opts);
  }
  if (typeof define === "function" && (define.cmd || define.amd)) {
    if (define.cmd) {
      require = seajs.use;
    } else {
      if (define.amd) {
        require = window.require;
      }
    }
    define(function() {
      return init;
    });
  } else {
    require = _require;
    window.setShareInfo = init;
  }
})();
