SC.initialize({
    client_id: '35233ac5f182ed5dc5d4c7ca506dd1f5'
});

var EmPlayer = function () {
    this.currentPlayer = false;
    this.currentTime = 0;
    this.duration = 0;
    this.update = null;
    this.playerState = false;
    this.delayTime = 1000;
};

EmPlayer.prototype = function () {
    function __create__() {
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
                clearTimeout(update);
                _this.currentTime = 0;
                currentTimeElement.innerHTML = "00:00";
                seekBar.value = _this.currentTime / _this.duration;
                playBtn.style.backgroundImage = 'url(/static/images/PlayIcon.png)';

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

var queryInfo = document.getElementById('queryInfo'),
    trackInfo = document.getElementById('trackInfo'),
    searchResult = document.getElementById('searchResult'),
    loopBtn = document.getElementById('loopBtn'),
    playBtn = document.getElementById('playBtn'),
    muteBtn = document.getElementById('muteBtn'),
    listBtn = document.getElementById('listBtn'),
    playList = document.getElementById('playList'),
    plist = document.getElementById('plist'),
    seekBar = document.getElementById('seekBar'),
    submitInfoBtn = document.getElementById('submitInfoBtn');

var currentPlayer = false;
var currentTime = 0, duration = 0;
var update = null;
var playerState = false, mutedState = false, loopState = false, showListState = false;
var delayTime = 1000;

// used to format time i.e. 00:00
function updateTime(time) {
    var sec = (time % 60 < 10) ? "0" + (time % 60).toString() : time % 60;
    var min = (time < 600) ? "0" + ((time - time % 60) / 60).toString() : (time - time % 60) / 60;
    return min + ":" + sec;

}

// used to update the progress bar per second
function updateProgress() {
    if (playerState) {
        if (currentTime < duration) {
            currentTime = currentTime + 1;
            document.getElementById('currentTime').innerHTML = updateTime(currentTime);
            seekBar.value = currentTime / duration;
            clearTimeout(update);
            update = setTimeout(updateProgress, delayTime);
        }
        else {
            currentTime = 0;
            currentPlayer.seek(currentTime);
            document.getElementById('currentTime').innerHTML = updateTime(currentTime);
            seekBar.value = currentTime / duration;
            playerState = false;
            clearTimeout(update);

            // if user chooses to loop this track
            if (loopState) {
                currentPlayer.play();
                currentPlayer.on('play-resume', function () {
                    playerState = true;
                    clearTimeout(update);
                    update = setTimeout(updateProgress, delayTime);
                });
            }
            else {
                playBtn.style.backgroundImage = 'url(/static/images/green/PlayIcon.png)';
            }
        }
    }
}

// to be executed when the user uses the url to search
// searchUrlForm.addEventListener('submit', function (event) {
//     event.preventDefault();
//     playTrack(queryUrl.value);
// });

// this function is used if you want to load a track and create a playlist at the same time
function playTrack(url) {
    SC.resolve(url).then(function (track) {
        return SC.stream('/tracks/' + track.id).then(function (player) {
            duration = Math.floor(track.duration / 1000);
            trackInfo.innerHTML = track.title + " - " + track.user.username;
            document.getElementById('duration').innerHTML = updateTime(duration);
            if (track.artwork_url != null)
                document.getElementById('trackCover').src = track.artwork_url.replace(/large/i, 'badge');
            else
                document.getElementById('trackCover').src = track.user['avatar_url'];
            if (currentPlayer)
                currentPlayer.pause();
            currentPlayer = player;

            // initialise the music controller
            clearTimeout(update);
            currentTime = 0;
            document.getElementById('currentTime').innerHTML = "00:00";
            seekBar.value = currentTime / duration;
            playBtn.style.backgroundImage = 'url(/static/images/PlayIcon.png)';

            var exist = false;
            var itemInfo = updateTime(Math.floor(track.duration / 1000)) + " - " + track.title + " - " + track.user.username;

            // determine whether this track was in the playlist
            if (plist.hasChildNodes()) {
                for (var j = 0; j < plist.children.length; j++) {
                    if (plist.children[j].children[1].textContent === itemInfo) {
                        exist = true;
                        break;
                    }
                }
            }

            // add this track to the playlist if it was not in the list
            if ((!plist.hasChildNodes()) || (!exist)) {
                var item = document.createElement('LI');
                plist.appendChild(item);

                var dropBtn = document.createElement('BUTTON');
                dropBtn.name = "dropBtn";
                item.appendChild(dropBtn);

                // var btnValue = document.createTextNode("-");
                dropBtn.setAttribute('style', "border: none; height: 18px; width: 18px; background-size: 100%; background-color: #FAFAFA; background-image: url('/static/images/DropTrackIcon.png'); background-repeat: no-repeat;background-position: center;");
                // dropBtn.appendChild(btnValue);

                var link = document.createElement('A');
                var linkInfo = document.createTextNode(itemInfo);
                link.href = track.permalink_url;
                item.appendChild(link);
                link.appendChild(linkInfo);

                // play the track when user click the link
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    playTrack(this.href);
                });

                // remove a track from the playlist when user click the drop button
                dropBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    plist.removeChild(item);
                });
            }
        }).catch(function () {
            console.log(track);
        });
    });
}

// this function is used if you only need load a track without creating a playlist and without the progressbar and cover pic
function onlyPlayTrack(url) {
    SC.resolve(url).then(function (track) {
        return SC.stream('/tracks/' + track.id).then(function (player) {
            duration = Math.floor(track.duration / 1000);
            trackInfo.innerHTML = track.title + " - " + track.user.username;
            document.getElementById('duration').innerHTML = updateTime(duration);
            // if (track.artwork_url != null)
            //     document.getElementById('trackCover').src = track.artwork_url.replace(/large/i, 'badge');
            // else
            //     document.getElementById('trackCover').src = track.user['avatar_url'];
            console.log('track is loaded.');
            if (currentPlayer)
                currentPlayer.pause();
            currentPlayer = player;

            // initialise the music controller
            clearTimeout(update);
            currentTime = 0;
            document.getElementById('currentTime').innerHTML = "00:00";
            seekBar.value = currentTime / duration;
            playBtn.style.backgroundImage = 'url(/static/images/green/PlayIcon.png)';
            console.log('all ok.');
        }).catch(function () {
            console.log(track);
        });
    });
}

function removeChildren(parentNode) {
    if (parentNode.hasChildNodes()) {
        parentNode.removeChild(parentNode.childNodes[0]);
        removeChildren(parentNode);
    }
}

// user searches a song from soundcloud with keyword of title, author or owner
if (submitInfoBtn !== null) {
    submitInfoBtn.addEventListener('click', function (event) {
        event.preventDefault();
        removeChildren(searchResult);
        SC.get('/tracks', {q: queryInfo.value}).then(
            function (tracks) {
                if (tracks.length > 0) {
                    for (var i = 0; i < tracks.length; i++) {
                        var item = document.createElement('LI');
                        var link = document.createElement('A');
                        var t = document.createTextNode(updateTime(Math.floor(tracks[i].duration / 1000)) + " - " + tracks[i].title + " - " + tracks[i].user.username);
                        link.href = tracks[i].permalink_url;
                        link.addEventListener('click', function (event) {
                            event.preventDefault();
                            playTrack(this.href);
                        });
                        searchResult.appendChild(item);
                        item.appendChild(link);
                        link.appendChild(t);
                    }
                    console.log(tracks);
                }
                else
                    searchResult.appendChild(document.createElement("P").appendChild(document.createTextNode("Oops, nothing was found, would you like to try another key word?")));
            });
    });
}

if (playBtn !== null) {
    playBtn.addEventListener('click', function () {
        if (currentPlayer) {
            if (playerState) {
                clearTimeout(update);
                playBtn.style.backgroundImage = 'url(/static/images/green/PlayIcon.png)';
                currentPlayer.pause();
                playerState = false;
            }
            else {
                playBtn.style.backgroundImage = 'url(/static/images/green/PauseIcon.png)';
                currentPlayer.play();
                currentPlayer.on('play-resume', function () {
                    playerState = true;
                    clearTimeout(update);
                    update = setTimeout(updateProgress, delayTime);
                });
            }
        }
    });
}

if (muteBtn !== null) {
    muteBtn.addEventListener('click', function () {
        if (currentPlayer) {
            if (mutedState) {
                muteBtn.style.backgroundImage = 'url(/static/images/green/SpeakerIcon.png)';
                currentPlayer.setVolume(1);
                mutedState = false;
            }
            else {
                muteBtn.style.backgroundImage = 'url(/static/images/green/MuteIcon.png)';
                currentPlayer.setVolume(0);
                mutedState = true;
            }
        }
    });
}

if (loopBtn !== null) {
    loopBtn.addEventListener('click', function () {
        if (currentPlayer) {
            if (loopState) {
                loopBtn.style.backgroundImage = 'url(/static/images/green/UnloopIcon.png)';
                loopState = false;
            }
            else {
                loopBtn.style.backgroundImage = 'url(/static/images/green/loopIcon.png)';
                loopState = true;
            }
        }
    });
}

if (listBtn !== null) {
    listBtn.addEventListener('click', function () {
        var classListOfPlayList = playList.classList;
        if (currentPlayer) {
            if (showListState) {
                classListOfPlayList.remove("show");
                classListOfPlayList.add("hidden");
                showListState = false;
            }
            else {
                classListOfPlayList.remove("hidden");
                classListOfPlayList.add("show");
                showListState = true;
            }
        }
    });
}

seekBar.addEventListener('click', function (e) {
    clearTimeout(update);
    currentTime = Math.floor(e.offsetX * duration / this.offsetWidth);
    currentPlayer.seek(currentTime * 1000);
    currentPlayer.on('seeked', function () {
        seekBar.value = currentTime / duration;
        currentPlayer.play();
        update = setTimeout(updateProgress, delayTime);
    });
});
