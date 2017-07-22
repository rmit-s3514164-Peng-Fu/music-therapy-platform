
var Messenger = function(options){
    this.config = {
        frequency: 5000,
        container: null
    };

    this.currentId = null;

    this.receivedMessages = [];

    $.extend(this.config, options, true);
};

Messenger.prototype = function(){
    function __start__() {
        _poll.call(this);

        $(window).on('msgr:poll', $.proxy(_updateRootView, this));
        $(window).on('msgr:thread', $.proxy(_updateChatBox, this));

        $(document.body).on('click', '.messenger-contact', $.proxy(_setCurrentThread, this));
        $(document.body).on('click', '#btn-message-send', $.proxy(_reply, this));
    }

    function _setCurrentThread(e) {
        this.currentId = $(e.target).data('id');
        _updateThread.call(this);

    }

    function _updateThread() {
        if(this.currentId == null) return;
        var currentId = this.currentId;
        $.ajax('/api/messages/'+this.currentId, {
            method: 'GET',
            success: $.proxy(function(data) {
                if(currentId != this.currentId) return; // if the id changed dont load
                $(window).trigger('msgr:thread', [data['data']]);
                setTimeout($.proxy(_updateThread, this), this.config.frequency);
            }, this)
        });
    }

    function _updateRootView(e, data) {
        var contacts = $('#messenger-contacts').empty();
        function add(convo){
            contacts.append($('<tr class="messenger-contact"><td data-id="'+convo['ReplyTo']+'">'+convo['Name']+'</td></tr>'));
        }
        // existing chats first, then others
        data['Conversations'].forEach(add);
        data['Available'].forEach(add);
    }

    function _updateChatBox(e, data) {
        $('.temp-message').remove();
        var _this = this;
        var chatbox = $('#chat-history');
        data.forEach(function(chat){
            if(_this.receivedMessages.indexOf(chat['ID']) == -1) {
                _this.receivedMessages.push(chat['ID']);
                chatbox.append($('<div class="clearfix"><div class="message ' + (chat['ToMe'] ? 'to-me' : 'from-me') + '">' + chat['Message'] + '</div></div>'));
            }
        });
    }

    function _reply() {
       var content = $('#message-content').val();
        $('#chat-history').append($('<div class="clearfix temp-message"><div class="message from-me">' + content + '</div></div>'));
        $('#message-content').val('');
        $.ajax('/api/messages/'+this.currentId, {
            contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify({'Content': content})
        });
    }

    function _poll() {
        $.ajax('/api/messages', {
            method: 'GET',
            success: $.proxy(function(data) {
                $(window).trigger('msgr:poll', [data['data']]);
                setTimeout($.proxy(_poll, this), this.config.frequency);
            }, this)
        })
    }

    return {
        constructor: Messenger,
        start: __start__
    }
}();
