define(function (require, exports, module) {
  var $ = require('$');
  var Detect = require('detect');
  var Path = require('./path');

  var configs = {};
  var isInit = false;
  var oldIE = !!(Detect.browser.ie && Detect.browser.version < 10);

  function pageLoad(href, data, reverse, state) {
    if (!href) return;
    if (typeof data === 'boolean') {
      state = reverse;
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
        transition(page, reverse, state);
        configs.onPageload && configs.onPageload(page);
      }
    });
  }

  function transition(to, reverse, state) {
    var activePage = $('.ui-page-active');
    var url = to.data('url');
    window.scrollTop = 0;

    //处理data-rel="back"
    $('[data-rel=back]', to).attr('href', activePage.data('url'));

    activePage.one('webkitTransitionEnd transitionend',function () {
      $(this).removeClass('slide out ui-page-active reverse').hide();
    });
    reverse && activePage.addClass('reverse');
    getComputedStyle(activePage[0])['-webkit-transform'];
    activePage.addClass('slide out');

    to.show().one('webkitTransitionEnd transitionend',function () {
      to.removeClass('slide in reverse').addClass('ui-page-active');
      configs.onTransform && configs.onTransform(to, reverse);
    });
    reverse && to.addClass('reverse');
    getComputedStyle(to[0])['-webkit-transform'];
    to.addClass('slide in');

    document.title = to.data('title') || document.title;
    if (state) {
      window.history.replaceState("", "", url);
    } else {
      location.hash = '#' + url;
    }
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
        var state = !($(this).data('state') === false);
        var page = $('[data-url="' + href + '"]');
        if (page.length) {
          transition(page, false, state);
        } else {
          pageLoad(href);
        }

        return false;
      });
      $(document).on('submit', 'form[data-transition]', function (e) {
        if (!this.onsubmit || this.onsubmit()) {
          var href = Path.convertUrlToDataUrl(this.action);
          var state = !($(this).data('state') === false);
          $('[data-url="' + href + '"]').remove();
          pageLoad(href, $(this).serialize(), false, state);
          return false;
        }
      });
      $(document).on('click', 'a[data-rel=back]', function () {
        var href = Path.convertUrlToDataUrl(this.href);
        var page = $('[data-url="' + href + '"]');
        if (page.length) {
          transition(page, true, true);
        } else {
          pageLoad(href, true, true);
        }
        return false;
      });

      $('[data-role=page]').addClass('ui-page-active')
        .attr('data-url', Path.convertUrlToDataUrl(location.href))
        .data('title', document.title);
    }
  }
});