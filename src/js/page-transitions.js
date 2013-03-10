define(function (require, exports, module) {
  var $ = require('$');
  var Detect = require('detect');
  var Path = require('./path');

  var configs = {};
  var isInit = false;
  var oldIE = !!(Detect.browser.ie && Detect.browser.version < 10);

  function pageLoad(href, data, reverse) {
    if (!href) return;
    if (typeof data === 'boolean') {
      reverse = data;
      data = null;
    }
    $.ajax({
      url: href,
      type: data ? 'post' : 'get',
      data: data,
      dataType: "html",
      success: function (html, textStatus, xhr) {
        var all = $("<div></div>"),
          newPageTitle = html.match(/<title[^>]*>([^<]*)/) && RegExp.$1,
          page;
        all.get(0).innerHTML = html;
        page = all.find('[data-role=page]').first().removeClass('ui-page-active').attr('data-url', href);
        if (newPageTitle) {
          page.data('title', newPageTitle);
        }
        $('body').append(page);
        transition(page, reverse);
        configs.onPageload && configs.onPageload(page);
      }
    });
  }

  function transition(to, reverse) {
    var tr = reverse ? 'slide reverse' : 'slide';
    window.scrollTop = 0;
    $('.ui-page-active').one('webkitAnimationEnd animationend',function () {
      $(this).removeClass(tr + ' out ui-page-active');
    }).addClass(tr + ' out');

    to.one('webkitAnimationEnd animationend',function () {
      to.removeClass(tr + ' in');
      configs.onTransform && configs.onTransform(to);
    }).addClass(tr + ' in ui-page-active');
    document.title = to.data('title') || document.title;
    window.history.replaceState("", "", to.data('url'));
  }

  return {
    init: function (options) {
      //不支持Windows Phone 7.x设备，直接跳转
      if (oldIE) return;
      if (isInit) return;
      isInit = true;
      $.extend(configs, options);
      $(document).on('click', 'a[data-transition]', function (e) {
        var href = Path.convertUrlToDataUrl(this.href);

        var page = $('[data-url="' + href + '"]');
        if (page.length) {
          transition(page);
        } else {
          pageLoad(href);
        }

        return false;
      });
      $(document).on('submit', 'form[data-transition]', function (e) {
        if (!this.onsubmit || this.onsubmit()) {
          var href = Path.convertUrlToDataUrl(this.action);
          $('[data-url="' + href + '"]').remove();
          pageLoad(href, $(this).serialize());
          return false;
        }
      });
      $(document).on('click', 'a[data-rel=back]', function () {
        var href = Path.convertUrlToDataUrl(this.href);
        var page = $('[data-url="' + href + '"]');
        if (page.length) {
          transition(page, true);
        } else {
          pageLoad(href, true);
        }
        return false;
      });

      $('[data-role=page]').addClass('ui-page-active')
        .attr('data-url', Path.convertUrlToDataUrl(location.href))
        .data('title', document.title);
    }
  }
});