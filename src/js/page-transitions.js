define(function (require, exports, module) {
  var $ = require('$');
  var Path = require('./path');

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
      }
    });
  }

  function transition(to, reverse) {
    var tr = reverse ? 'slide reverse' : 'slide';
    $('.ui-page-active').one('webkitAnimationEnd animationend',function () {
      $(this).removeClass(tr + ' out ui-page-active');
    }).addClass(tr + ' out');
    to.one('webkitAnimationEnd animationend',function () {
      to.removeClass(tr + ' in');
    }).addClass(tr + ' in ui-page-active');
    document.title = to.data('title') || document.title;
    window.history.replaceState("", "", to.data('url'));
  }

  return {
    init: function () {
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