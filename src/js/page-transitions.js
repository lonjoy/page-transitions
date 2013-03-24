define(function (require, exports, module) {
  var $ = require('$');
  var Detect = require('detect');
  var Path = require('./path');
  var Transform = require('./transform');

  var configs = {};
  var isInit = false;
  var supported = (Detect.support.transform && Detect.support.transition);
  var tapEvent = (Detect.support.touch ? 'touchend' : 'click');

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
    window.scrollTo(0, 1);

    //处理data-rel="back"
    $('[data-rel=back]', to).attr('href', activePage.data('url'));

    activePage.one('webkitTransitionEnd transitionend',function () {
      $(this).removeClass('slide ui-page-active').hide();
    }).addClass('slide');

    Transform.translate(to, [reverse ? '-100%' : '100%', 0])
    to.show().one('webkitTransitionEnd transitionend',function () {
      to.removeClass('slide').addClass('ui-page-active');
      configs.onTransform && configs.onTransform(to, reverse);
    }).addClass('slide');

    activePage.css('transform');
    to.css('transform');

    Transform.translate(activePage, [reverse ? '100%' : '-100%', 0]);
    Transform.translate(to, [0, 0]);

    document.title = to.data('title') || document.title;
    if (state) {
      window.history.replaceState("", "", url);
    } else {
      location.hash = '#' + url;
    }
  }

  return {
    init: function (options) {
      //不支持动画和变形特性，直接跳转
      if (!supported) return;
      if (isInit) return;
      isInit = true;
      $.extend(configs, options);
      $(document).on(tapEvent, 'a[data-transition]', function (e) {
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
      $(document).on(tapEvent, 'a[data-rel=back]', function () {
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
    },
    forward: function (url, state) {
      if (supported) {
        var page = $('[data-url="' + url + '"]');
        if (page.length) {
          transition(page, false, state);
        } else {
          pageLoad(url);
        }
      } else {
        self.location.href = url;
      }
    },
    backward: function (url) {
      if (supported) {
        var page = $('[data-url="' + url + '"]');
        if (page.length) {
          transition(page, true, true);
        } else {
          pageLoad(url, true, true);
        }
      } else {
        self.location.href = url;
      }
    }
  }
});