function extend(ChildClass, ParentClass, overrides, properties) {
	ChildClass.prototype =  Object.create(ParentClass.prototype, properties);
	ChildClass.prototype.constructor = ChildClass;
    $.extend(ChildClass.prototype, overrides);
    ChildClass.prototype.__super__ = function(){return ParentClass};

}


var HashHandler = function(content_selector) {
    this.pageLookup = [];
    this.content_selector = content_selector;
    this.current_page = null;
};

HashHandler.prototype = function() {

    function _addPageHandler(regex, page) {
        this.pageLookup.push({re: regex, page: page});
    }

    function _processLinks() {
        $(document).on('click', '.ajaxlink', function (e) {
            var $this = $(e.currentTarget);
            if ($this.attr('target'))
                return;

            var new_hash = $this.attr('href');
            if(typeof new_hash == 'undefined') {
                return;
            }
            if (new_hash == '/')
                new_hash = '';

            var old_hash = window.location.hash;
            if (old_hash.indexOf('#', 0) == 0)
                old_hash = old_hash.substring(old_hash.indexOf('#', 0) + 1);

            e.preventDefault();

            if (new_hash != old_hash) {
                $(window).trigger('page-handler:set-page', [(new_hash == '/') ? '' : new_hash]);
            }

        });
    }

    function _getHash() {
        var url = location.href.split('#').splice(1).join('#');
        var postExecute = [];
        //BEGIN: IE11 Work Around
        if (!url) {
            try {
                var documentUrl = window.document.URL;
                if (documentUrl) {
                    if (documentUrl.indexOf('#', 0) > 0 && documentUrl.indexOf('#', 0) < (documentUrl.length + 1)) {
                        url = documentUrl.substring(documentUrl.indexOf('#', 0) + 1);

                    }
                }
            } catch (err) {
            }
        }
        //END: IE11 Work Around

        if (!url)
            url = '/'; // default to home page.
        return url;
    }
    function _processCommand() {
        var pageLookup = this.pageLookup;
        var url = _getHash();

        if (!url)
            url = '/'; // default to home page.

        var cmd_args = [];
        var page = null;
        for (var i = 0; i < pageLookup.length; i++) {
            var cmd_info = pageLookup[i];
            var m = cmd_info.re.exec(url);
            if (m != null) {
                page = cmd_info.page;
                var margs = m.slice(1);
                for (var j = 0; j < margs.length; j++) {
                    if (typeof margs[j] == "undefined") {
                        cmd_args.push(null);
                    }
                    else {
                        cmd_args.push(margs[j]);
                    }
                }
                break;
            }
        }

        if (!page) {
            $(window).trigger('page-handler:fail-load');
            return;
        }
        _loadPage.call(this, page, cmd_args);
        $(window).trigger('page-handler:page-change');

    }

    function _loadPage(page, args) {
        var _this = this;

        $.ajax(page.url, {
            method: 'GET',
            success: function (data) {
                if (_this.current_page) {
                    _this.current_page.unregisterEvents();
                    _this.current_page.teardown();
                }
                $(_this.content_selector).html(data);
                $(window).trigger('page-handler:change');

                _this.current_page = page;
                page.load.apply(page, args);
                $('html,body').scrollTop(0);
            },
            fail: function () {
                $(window).trigger('page-handler:fail-load');
            }
        });

    }

    function _getCurrentPage() {
        return this.current_page;
    }

    function _changePage(e, page) {
        window.location.hash = page;
        //_processCommand.call(this);
    }

    function __init__() {
        $(window).on('hashchange', $.proxy(_processCommand, this));
        $(window).on('page-handler:set-page', $.proxy(_changePage, this));
        _processLinks.call(this);
        _processCommand.call(this);
    }

    return {
        constructor: HashHandler,
        addPageHandler: _addPageHandler,
        getCurrentPage: _getCurrentPage,
        init: __init__
    }
}();

var Page = function(url) {
    this.url = url;
    this.events = [];
};

Page.prototype = function() {

    function _registerEvents(events) {
        var _this = this;
        events.forEach(function (event) {
            var parent = event.parent ? event.parent : window;
            _this.events.push(event);
            if(event.selector) $(parent).on(event.type, event.selector, event.fn);
            else $(parent).on(event.type, event.fn);
        });
    }

    function _unregisterEvents() {
        this.events.forEach(function (event) {
            var parent = event.parent ? event.parent : window;
            $(parent).off(event.type, event.fn);
        });
    }

    function _teardown() {}

    function _load() {}

    return {
        constructor: Page,
        registerEvents: _registerEvents,
        load: _load,
        teardown: _teardown,
        unregisterEvents: _unregisterEvents
    }
}();
