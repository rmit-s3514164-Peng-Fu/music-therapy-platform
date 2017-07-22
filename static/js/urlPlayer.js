// https://soundcloud.com/gochaism/moonlight-sonata-x-calling-from-heaven
// https://soundcloud.com/blueeee/02-locorocos-song-locoroco
// https://soundcloud.com/nasa/apollo-12-all-weather-testing
// http://code.runnable.com/Uuha4TjUiuUiAAAj/stream-tracks-from-soundcloud-and-control-using-javascript
SC.initialize({
    client_id: '35233ac5f182ed5dc5d4c7ca506dd1f5'
});

var searchUrlForm = document.getElementById('searchUrlForm'),
    searchInfoForm = document.getElementById('searchInfoForm'),
    queryUrl = document.getElementById('queryUrl'),
    queryInfo = document.getElementById('queryInfo'),
    trackInfo = document.getElementById('trackInfo'),
    searchResult = document.getElementById('searchResult'),
    loopBtn = document.getElementById('loopBtn'),
    playBtn = document.getElementById('playBtn'),
    muteBtn = document.getElementById('muteBtn'),
    listBtn = document.getElementById('listBtn'),
    playList = document.getElementById('playList'),
    plist = document.getElementById('plist'),
    seekBar = document.getElementById('seekBar');

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
                playBtn.style.backgroundImage = 'url(/static/images/PlayIcon.png)';
            }
        }
    }
}

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

            // add this track to the playlist if it was not in the list
            var exist = false;
            var itemInfo = updateTime(Math.floor(track.duration / 1000)) + " - " + track.title + " - " + track.user.username;

            if (plist.hasChildNodes()) {
                for (var j = 0; j < plist.children.length; j++) {
                    if (plist.children[j].children[0].textContent === itemInfo) {
                        exist = true;
                        break;
                    }
                }
            }

            if ((!plist.hasChildNodes()) || (!exist)) {
                var item = document.createElement('LI');
                var link = document.createElement('A');
                var t = document.createTextNode(itemInfo);
                link.href = track.permalink_url;
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    playTrack(this.href);
                });
                plist.appendChild(item);
                item.appendChild(link);
                link.appendChild(t);
            }
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

// to be executed when the user uses the url to search
searchUrlForm.addEventListener('submit', function (event) {
    event.preventDefault();
    playTrack(queryUrl.value);
});

// user searches a song from soundcloud with keyword of title, author or owner
searchInfoForm.addEventListener('submit', function (event) {
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

loopBtn.addEventListener('click', function () {
    if (currentPlayer) {
        if (loopState) {
            loopBtn.style.backgroundImage = 'url(/static/images/UnloopIcon.png)';
            loopState = false;
        }
        else {
            loopBtn.style.backgroundImage = 'url(/static/images/loopIcon.png)';
            loopState = true;
        }
    }
});

playBtn.addEventListener('click', function () {
    if (currentPlayer) {
        if (playerState) {
            clearTimeout(update);
            playBtn.style.backgroundImage = 'url(/static/images/PlayIcon.png)';
            currentPlayer.pause();
            playerState = false;
        }
        else {
            playBtn.style.backgroundImage = 'url(/static/images/PauseIcon.png)';
            currentPlayer.play();
            currentPlayer.on('play-resume', function () {
                playerState = true;
                clearTimeout(update);
                update = setTimeout(updateProgress, delayTime);
            });
        }
    }
});

muteBtn.addEventListener('click', function () {
    if (currentPlayer) {
        if (mutedState) {
            muteBtn.style.backgroundImage = 'url(/static/images/SpeakerIcon.png)';
            currentPlayer.setVolume(1);
            mutedState = false;
        }
        else {
            muteBtn.style.backgroundImage = 'url(/static/images/MuteIcon.png)';
            currentPlayer.setVolume(0);
            mutedState = true;
        }
    }
});

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
