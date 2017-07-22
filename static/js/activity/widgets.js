var Widget = function(data, id){
    this.data = data;
    this.id = id;
};

Widget.prototype = function(){
    function _render() {
        throw 'Render not implemented';
    }

    function _edit() {
        throw 'Edit not implemented';
    }

    function _renderView() {
        var view = $(this.render());
        if (admin_mode) {
            $(view)
                .prepend('<button class="btn btn-xs btn-default move-widget-up" data-widget-id="'+this.id+'"><i class="fa fa-arrow-up"></i></button>')
                .prepend('<button class="btn btn-xs btn-default move-widget-down" data-widget-id="'+this.id+'"><i class="fa fa-arrow-down"></i></button>')
                .append('<button class="btn btn-xs btn-default edit-widget" data-widget-id="'+this.id+'"><i class="fa fa-pencil"></i></button>')
                .append('<button class="btn btn-xs btn-default delete-widget" data-widget-id="'+this.id+'"><i class="fa fa-close"></i></button>');

        }
        this.view = view;
        return view;
    }

    return {
        constructor: Widget,
        renderView: _renderView,
        render: _render,
        edit: _edit
    }
}();

var AudioWidget = function() {
    Widget.apply(this, arguments);
};

extend(AudioWidget, Widget, function() {
    function _render() {
        var player = new EmPlayer();
        player.create();
        player.loadUrl(this.data);
        return player.view;
    }


    function _edit() {
        var content = this.data;
        var textArea = $('<textarea class="edit-widget-ta">');
        textArea.val(content);
        this.view.html(textArea);
        textArea.focus();
        textArea.on('blur', $.proxy(function () {
            this.data = textArea.val();
            var oldView = this.view;
            oldView.before(this.renderView());
            oldView.remove();
            $(window).trigger('save-widget', [this.id, this.data]);
        }, this));

    }

    return {
        render: _render,
        edit: _edit
    }
}());

var TagWidget = function() {
    Widget.apply(this, arguments);
    this.tag = 'p';
    this.class = '';
};

extend(TagWidget, Widget, function(){
    function _render() {
        return '<'+this.tag+' class="'+this.class+'">'+this.data+'</'+this.tag+'>';
    }

    function _edit() {
        var content = this.data;
        var textArea = $('<textarea class="edit-widget-ta">');
        textArea.val(content);
        this.view.html(textArea);
        textArea.focus();
        textArea.on('blur', $.proxy(function() {
            this.data = textArea.val();
            var oldView = this.view;
            oldView.before(this.renderView());
            oldView.remove();
            $(window).trigger('save-widget', [this.id, this.data]);
        }, this));
    }

    return {
        render: _render,
        edit: _edit
    }
}());

var TextWidget = function() {
    TagWidget.apply(this, arguments);
    this.tag = 'p';
    this.class = 'step-paragraph'
};

extend(TextWidget, TagWidget, function(){
    return {}
}());

var QuoteWidget = function() {
    TagWidget.apply(this, arguments);
    this.tag = 'p';
    this.class = 'step-quote'
};

extend(QuoteWidget, TagWidget, function(){
    return {}
}());

var TitleWidget = function() {
    TagWidget.apply(this, arguments);
    this.tag = 'h2';
};

extend(TitleWidget, TagWidget, function(){
    return {}
}());

var SubTitleWidget = function() {
    TagWidget.apply(this, arguments);
    this.tag = 'h4';
};

extend(SubTitleWidget, TagWidget, function(){
    return {}
}());

var SongSearchWidget = function() {
    Widget.apply(this, arguments);
};

extend(SongSearchWidget, Widget, function(){
    function _render() {
        return new Searcher().create();
    }
   return {
        render: _render
   }
}());

var SavePlaylistWidget = function(){
    Widget.apply(this, arguments);
    this.view = null;
};

extend(SavePlaylistWidget, Widget, function(){

    function _render() {
        var view = $('<div class="row">' +
                '<div class="col-md-6">' +
            '<ul class="existing-tracks"></ul>' +
            '</div>' +
            '<div class="col-md-4">' +
            '<select class="playlist-select form-control">' +
            '<option selected disabled>Select an existing playlist</option>' +
            '</select>' +
            '</div>' +
            '<div class="col-md-2">' +
            '<button class="btn mint">Add songs</button>' +
            '</div>' +
            '</div>');
        var trackArea = view.find('.existing-tracks');
        PocketPlayer.withTracks(function(track){
            trackArea.append(track);
        });
        var select = view.find('.playlist-select');
        $.ajax('/api/playlist', {
            method: 'GET',
            success: function(data) {

                data['data'].forEach(function(playlist){
                    select.append('<option value="'+playlist['id']+'">'+playlist['name']+'</option>');
                });
                select.append('<option value="-1">Create a new playlist</option>');
            }
        });

        function _playlistSaved() {
            alert('saved');
        }

        view.find('button').on('click', function(){
            var playlistId = select.val();
            var packet = {'tracks': PocketPlayer.getAllTrackURLs()};

            if(playlistId == -1) {
                $('#new-playlist-name').val('');
                $('#new-playlist-add').off().on('click', function(){
                    packet['name'] = $('#new-playlist-name').val();
                    packet['description'] = $('#new-playlist-description').val();
                    $.ajax('/api/playlist', {
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(packet),
                        success: function(data) {
                            $('#new-activity-modal').modal('hide');
                            _playlistSaved(data);
                        }
                    });

                });
                $('#new-playlist-modal').modal('show');
            } else {
                $.ajax('/api/playlist/'+playlistId, {
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(packet),
                    success: _playlistSaved
                })
            }
        });
        return view;
    }
    return {
        render: _render
    }
}());

Widget.create = function(type, data, id) {
    var cls;
    switch(type) {
        case "text":
            cls = TextWidget;
            break;
        case "title":
            cls = TitleWidget;
            break;
        case "subtitle":
             cls = SubTitleWidget;
            break;
        case "quote":
             cls = QuoteWidget;
            break;
        case "audio":
            cls = AudioWidget;
            break;
        case "song":
            cls = SongSearchWidget;
            break;
        case "save":
            cls = SavePlaylistWidget;
            break;
    }
    return new cls(data, id);
};


SC.initialize({
    client_id: '35233ac5f182ed5dc5d4c7ca506dd1f5'
});

var Searcher = function() {

};

Searcher.prototype = function(){

    function __create__() {
        var view = '<div class="search-container">' +
            '<div class="row">' +
                '<div class="col-md-6">' +
                    '<label for="song-search">Enter a Title, Owner or Author</label>' +
                    '<div class="input-group">' +
                        '<input type="text" class="form-control input-query" />' +
                        '<span class="input-group-btn">' +
                            '<button class="btn mint btn-search">Search</button>' +
                        '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="col-md-6">' +
                    '<h4>Results</h4>' +
                    '<div class="search-result">' +
                    '</div>' +
                '</div>' +
            '</div>';
        this.view = $(view);
        this.view.find('.btn-search').on('click', $.proxy(_search, this));
        $(document.body).on('click', '.li-track', function(e){
            PocketPlayer.addTrack($(e.currentTarget));
        });
        return this.view;
    }

    function _createResult(track) {
        return '<li class="li-track" data-title="'+track['title']+'" data-track="'+track['permalink_url']+'">' +
            track['title'] + ' - ' + track['user']['username'] + ' - ' + updateTime(Math.floor(track['duration'] / 1000)) +
            '</li>';
    }

    function _search() {
        var _this = this;
        var query = _this.view.find('.input-query').val();
        SC.get('/tracks', {q: query}).then(
        function (tracks) {
            if (tracks.length > 0) {
                var container = _this.view.find('.search-result').html('<ul></ul>').find('ul');
                tracks.forEach(function(track){
                    container.append(_createResult(track));
                });
                console.log(tracks);
            }
            else
                _this.view.find('.search-result').html('<p>No results found.</p>');
        });
    }

    return {
        constructor: Searcher,
        create: __create__
    }
}();

var EmPlayer = function(){
    this.currentPlayer = false;
    this.currentTime = 0;
    this.duration = 0;
    this.update = null;
    this.playerState = false;
    this.delayTime = 1000;
};

EmPlayer.prototype = function(){
    function __create__() {
        // TODO: other playback controls
        var view = $('<div class="container">');
        view.html(
            '<div class="col-xs-3 col-sm-1" style="padding: 0;">' +
            '<img src="/static/images/cover.png" class="img-responsive img-thumbnail" id="trackCover">' +
            '</div>' +
            '<div class="col-xs-9 col-sm-11" style="padding: 0;">' +
            '<div class="col-xs-12 col-sm-12">' +
            '<span id="trackInfo">&nbsp</span>' +
            '</div>' +
            '<div class="col-xs-7 col-sm-10">' +
            '<span id="currentTime">00:00</span>/<span id="duration">00:00</span>' +
            '</div>' +
            '<div class="btn btn-group col-xs-5 col-sm-2" style="padding: 0px;">' +
            '<button type="button" id="playBtn"></button>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-12">' +
            '<progress id="seekBar" value="0" max="1" style="width: 100%;"></progress>' +
            '</div>' +
            '</div>');
        this.view = view;
    }

    function _togglePlay() {
        var playBtn = this.view.find('#playBtn')[0];
        if (this.currentPlayer) {
            if (this.playerState) {
                clearTimeout(this.update);
                this.currentPlayer.pause();
                this.playerState = false;
            }
            else {
                playBtn.style.backgroundImage = 'url(/static/images/PauseIcon.png)';
                this.currentPlayer.play();
                this.currentPlayer.on('play-resume', $.proxy(function () {
                    this.playerState = true;
                    clearTimeout(this.update);
                    this.update = setTimeout($.proxy(_updateProgress, this), this.delayTime);
                }, this));
            }
        }
    }

    function _updateProgress() {
        var seekBar = this.view.find('#seekBar')[0];
        var currentTimeElement = this.view.find('#currentTime')[0];

        if (this.playerState) {
            if (this.currentTime < this.duration) {
                this.currentTime = this.currentTime + 1;
                currentTimeElement.innerHTML = updateTime(this.currentTime);
                seekBar.value = this.currentTime / this.duration;
                clearTimeout(this.update);
                this.update = setTimeout($.proxy(_updateProgress, this), this.delayTime);
            }
            else {
                this.currentTime = 0;
                this.currentPlayer.seek(this.currentTime);
                currentTimeElement.innerHTML = updateTime(this.currentTime);
                seekBar.value = this.currentTime / this.duration;
                this.playerState = false;
                clearTimeout(this.update);
            }
        }
    }

    function _loadUrl(url) {
        var _this = this;
        var trackInfo = this.view.find('#trackInfo')[0];
        var durationElement = this.view.find('#duration')[0];
        var trackCoverElement = this.view.find('#trackCover')[0];
        var currentTimeElement = this.view.find('#currentTime')[0];
        var seekBar = this.view.find('#seekBar')[0];
        var playButton = this.view.find('#playBtn');

        SC.resolve(url).then(function (track) {
            return SC.stream('/tracks/' + track.id).then(function (player) {
                _this.duration = Math.floor(track.duration / 1000);
                trackInfo.innerHTML = track.title + " - " + track.user.username;
                durationElement.innerHTML = updateTime(duration);
                if (track.artwork_url != null)
                    trackCoverElement.src = track.artwork_url.replace(/large/i, 'badge');
                else
                    trackCoverElement.src = track.user['avatar_url'];
                if (_this.currentPlayer)
                    _this.currentPlayer.pause();
                _this.currentPlayer = player;

                // initialise the music controller
                clearTimeout(_this.update);
                _this.currentTime = 0;
                currentTimeElement.innerHTML = "00:00";
                seekBar.value = _this.currentTime / _this.duration;
                //playBtn.style.backgroundImage = 'url(images/PlayIcon.png)';

                // add this track to the playlist if it was not in the list
                var exist = false;
                // var itemInfo = updateTime(Math.floor(track.duration / 1000)) + " - " + track.title + " - " + track.user.username;
                durationElement.innerHTML = updateTime(Math.floor(track.duration / 1000));

                playButton.on('click', $.proxy(_togglePlay, _this));

            }).catch(function () {
                console.log(track);
            });
        });
    }

    return {
        constructor: EmPlayer,
        create: __create__,
        loadUrl: _loadUrl
    }
}();

var PocketPlayer = function(){
    var view = '<div id="pocket-player">' +
        '<div class="pocket-player-content container">' +
        '<div class="container">' +
        '<div class="playlist-area">' +
        '<ul>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '<div class="player-area"></div>' +
        '</div>' +
        '</div>';
    var player = new EmPlayer();
    var tracks = [];

    function __init__() {
        player.create();
        view = $(view);
        view.find('.player-area').append(player.view);
        view.on('click', '.pocket-player-track', function(){
            player.loadUrl($(this).data('track'));
        });
        $(document.body).append(view);
    }

    function _addTrack(li) {
        tracks.push(li);
        var ul = view.find('.playlist-area').find('ul');

        // add it to the pocket player
        var stripped = __strip_track(li);
        stripped.addClass('pocket-player-track');
        ul.append(stripped);

    }

    function __strip_track(track) {
        var altered = $(track.prop('outerHTML'));
            altered.removeClass('li-track');
        return altered;
    }

    function _getTrackViews(callback) {
        tracks.forEach(function(t){
            callback(__strip_track(t));
        });
    }

    function _getAllTracks() {
        var trackUrls = [];
        tracks.forEach(function(li){
           trackUrls.push({url: li.data('track'), title: li.data('title')});
        });
        return trackUrls;
    }
    return {
        init: __init__,
        withTracks: _getTrackViews,
        addTrack: _addTrack,
        getAllTrackURLs: _getAllTracks
    }
}();

function updateTime(time) {
    var sec = (time % 60 < 10) ? "0" + (time % 60).toString() : time % 60;
    var min = (time < 600) ? "0" + ((time - time % 60) / 60).toString() : (time - time % 60) / 60;
    return min + ":" + sec;

}
