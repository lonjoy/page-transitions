define(function (require, exports, module) {
  var $ = require('$');
  var Detect = require('detect');

  var configs = {};
  var isInit = false;
  var supported = (Detect.support.transform && Detect.support.transition);
  var tapEvent = 'touchend click';
  var transitionEvent = 'webkitTransitionEnd transitionend';

  function getPageName(url) {
    return url.split('?')[0];
  }

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
        page = all.find('[data-role=page]').first().removeClass('ui-page-active').css('transition', '0ms').hide().attr('data-url', href);
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
    if (activePage.data('transited'))
      return;
    activePage.data('transited', true);
    to.data('transited', true);

    var url = to.data('url');
    window.scrollTo(0, 1);

    var pageWidth = $(window).width();

    activePage.one(transitionEvent, function () {
      console.info(1);
      $(this).removeClass('ui-page-active')
        .width('100%')
        .css('transition', '0ms')
        .removeData('transited')
        .hide();
    });

    to.show().one(transitionEvent, function () {
      console.info(2);
      $(this).addClass('ui-page-active')
        .width('100%')
        .css('transition', '0ms')
        .removeData('transited');
      configs.onTransform && configs.onTransform($(this), reverse);
    });

    activePage.width(pageWidth + 'px').css('transform', 'translateX(0px)');
    to.width(pageWidth + 'px').css('transform', (reverse ? 'translateX(-' + pageWidth + 'px)' : 'translateX(' + pageWidth + 'px)'));

    setTimeout(function () {
      activePage.css('transition', '350ms');
      to.css('transition', '350ms');

      activePage.css('transform', (reverse ? 'translateX(' + pageWidth + 'px)' : 'translateX(-' + pageWidth + 'px)'));
      to.css('transform', 'translateX(0px)');
    }, 50);

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
      $.extend(configs, options);
      $(document).on(tapEvent, 'a[data-transition]',function (e) {
        var href = $(this).attr('href');
        var state = !($(this).data('state') === false);
        var page = $('[data-url*="' + getPageName(href) + '"]');
        if (page.length) {
          transition(page, false, state);
        } else {
          pageLoad(href);
        }

        return false;
      }).on('click touchend', 'a[data-transition]', function (e) {
          return false;
        });
      $(document).on('submit', 'form[data-transition]', function (e) {
        if (!this.onsubmit || this.onsubmit()) {
          var href = $(this).attr('action');
          var state = !($(this).data('state') === false);
          $('[data-url=^"' + getPageName(href) + '"]').remove();
          pageLoad(href, $(this).serialize(), false, state);
          return false;
        }
      });
      $(document).on(tapEvent, 'a[data-rel=back]',function () {
        var href = $(this).attr('href');
        var page = $('[data-url*="' + getPageName(href) + '"]');
        if (page.length) {
          transition(page, true, true);
        } else {
          pageLoad(href, true, true);
        }
        return false;
      }).on('click touchend', 'a[data-rel=back]', function (e) {
          return false;
        });

      $('[data-role=page]').addClass('ui-page-active')
        .css('transition', '0ms')
        .attr('data-url', getPageName(location.href))
        .data('title', document.title);
    },
    forward: function (url, state) {
      if (supported) {
        var page = $('[data-url*="' + getPageName(url) + '"]');
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
        var page = $('[data-url=^"' + getPageName(url) + '"]');
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