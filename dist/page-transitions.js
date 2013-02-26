define("handy/page-transitions/1.0.0/js/path",["gallery/zepto/1.0.0/zepto"],function(a){var b=a("gallery/zepto/1.0.0/zepto"),c=b("head"),d=c.children("base"),e={urlParseRE:/^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/,isSameDomain:function(a,b){return e.parseUrl(a).domain===e.parseUrl(b).domain},isRelativeUrl:function(a){return""===e.parseUrl(a).protocol},isAbsoluteUrl:function(a){return""!==e.parseUrl(a).protocol},parseLocation:function(){return this.parseUrl(this.getLocation())},getLocation:function(a){var b=a?this.parseUrl(a):location,c=this.parseUrl(a||location.href).hash;return c="#"===c?"":c,b.protocol+"//"+b.host+b.pathname+b.search+c},makeUrlAbsolute:function(a,b){if(!e.isRelativeUrl(a))return a;void 0===b&&(b=documentBase);var c=e.parseUrl(a),d=e.parseUrl(b),f=c.protocol||d.protocol,g=c.protocol?c.doubleSlash:c.doubleSlash||d.doubleSlash,h=c.authority||d.authority,i=""!==c.pathname,j=e.makePathAbsolute(c.pathname||d.filename,d.pathname),k=c.search||!i&&d.search||"",l=c.hash;return f+g+h+j+k+l},parseLocation:function(){return this.parseUrl(this.getLocation())},parseUrl:function(a){if("object"==typeof a)return a;var b=e.urlParseRE.exec(a||"")||[];return{href:b[0]||"",hrefNoHash:b[1]||"",hrefNoSearch:b[2]||"",domain:b[3]||"",protocol:b[4]||"",doubleSlash:b[5]||"",authority:b[6]||"",username:b[8]||"",password:b[9]||"",host:b[10]||"",hostname:b[11]||"",port:b[12]||"",pathname:b[13]||"",directory:b[14]||"",filename:b[15]||"",search:b[16]||"",hash:b[17]||""}},isEmbeddedPage:function(a){var b=e.parseUrl(a);return""!==b.protocol?b.hash&&(b.hrefNoHash===this.documentUrl.hrefNoHash||this.documentBaseDiffers&&b.hrefNoHash===this.documentBase.hrefNoHash):/^#/.test(b.href)},convertUrlToDataUrl:function(a){var b=this.parseUrl(a);return this.isEmbeddedPage(b)?b.hash.replace(/^#/,""):this.isSameDomain(b,this.documentBase)?b.hrefNoHash.replace(this.documentBase.domain,""):window.decodeURIComponent(a)}};return e.documentUrl=e.parseLocation(),e.documentBase=d.length?e.parseUrl(e.makeUrlAbsolute(d.attr("href"),e.documentUrl.href)):e.documentUrl,e.documentBaseDiffers=e.documentUrl.hrefNoHash!==e.documentBase.hrefNoHash,e}),define("handy/page-transitions/1.0.0/js/page-transitions",["./path","gallery/zepto/1.0.0/zepto"],function(a){function b(a,b,e){a&&("boolean"==typeof b&&(e=b,b=null),d.ajax({url:a,type:b?"post":"get",data:b,dataType:"html",success:function(b){var f,g=d("<div></div>"),h=b.match(/<title[^>]*>([^<]*)/)&&RegExp.$1;g.get(0).innerHTML=b,f=g.find("[data-role=page]").first().removeClass("ui-page-active").attr("data-url",a),h&&f.data("title",h),d("body").append(f),c(f,e)}}))}function c(a,b){var c=b?"slide reverse":"slide";d(".ui-page-active").one("webkitAnimationEnd animationend",function(){d(this).removeClass(c+" out ui-page-active")}).addClass(c+" out"),a.one("webkitAnimationEnd animationend",function(){a.removeClass(c+" in")}).addClass(c+" in ui-page-active"),document.title=a.data("title")||document.title,window.history.replaceState("","",a.data("url"))}var d=a("gallery/zepto/1.0.0/zepto"),e=a("./path");return{init:function(){d(document).on("click","a[data-transition]",function(){var a=e.convertUrlToDataUrl(this.href),f=d('[data-url="'+a+'"]');return f.length?c(f):b(a),!1}),d(document).on("submit","form[data-transition]",function(){if(!this.onsubmit||this.onsubmit()){var a=e.convertUrlToDataUrl(this.action);return d('[data-url="'+a+'"]').remove(),b(a,d(this).serialize()),!1}}),d(document).on("click","a[data-rel=back]",function(){var a=e.convertUrlToDataUrl(this.href),f=d('[data-url="'+a+'"]');return f.length?c(f,!0):b(a,!0),!1}),d("[data-role=page]").addClass("ui-page-active").attr("data-url",e.convertUrlToDataUrl(location.href)).data("title",document.title)}}});