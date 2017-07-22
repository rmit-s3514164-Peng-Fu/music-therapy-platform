var StoryboardPage = function() {
    Page.apply(this, arguments);
    this.activity_id = null;
};

extend(StoryboardPage, Page, function(){
    function construct_card(stepId, content) {
        return '<div class="col-xs-6 col-sm-3 col-md-2">' +
                        '<div ' +
                    (stepId ? ('data-step-no="'+ stepId+ '" ') : '') +
                    'class="step-panel panel panel-default">' +
                        '<div class="panel-heading">' +
                        '</div>' +
                        '<div class="panel-body">' +
                        content +
                        '</div>' +
                        '</div>' +
                        '</div>';
    }

    function _addStep() {
        var value = $('#new-step-name').val();
        var packet = {'title': value};
        $.ajax('/api/activity/'+this.activity_id+'/steps', {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(packet),
            success: function(data){
                $('#create-new-step').before(construct_card(data['data']['id'], value));
                $('#new-step-name').val('');
                $('#new-step-modal').modal('hide');
            }
        });
    }

    function _load(activityId) {
        this.activity_id = activityId;

        this.registerEvents([
            {parent: document.body, selector: '#btn-add-step', type: 'click', fn: $.proxy(_addStep, this)},
            {parent: document.body, selector: '.step-panel', type: 'click', fn: function(e){
                var stepNo = $(e.currentTarget).data('stepNo');
                if(typeof stepNo == 'undefined') return; // dont want to trigger a page change for add new step
                $(window).trigger('page-handler:set-page', [''+activityId+'/'+stepNo]);
            }}
        ]);

        $.ajax('/api/activity/'+activityId+'/steps', {
            method: 'GET',
            success: function(data) {
                var container = $('#steps-container');
                data['data'].forEach(function(step){
                    container.append(construct_card(step['step_no'], step['title']));
                });
                var newStep = $(construct_card('', '<i>New Step...</i>'));
                newStep.addClass("faded").attr('id', 'create-new-step');
                newStep.on('click', function(){
                    $('#new-step-modal').modal('show');
                });
                container.append(newStep);
            }
        });
    }

    return {
        load: _load
    }
}());

var NewActivityPage = function() {
    Page.apply(this, arguments);
};

extend(NewActivityPage, Page, function(){

    function _populateSelect(data) {
        var select = $('#existing-activities');
        select.empty();
        select.append('<option selected disabled>Select an Activity</option>');
        data['data'].forEach(function(activity){
            select.append('<option value="'+activity.id+'">'+activity.name+'</option>');
        });
        select.on('change', function() {
            $(window).trigger('page-handler:set-page', [$(this).val()]);
        });
    }

    function _createActivity() {
        var packet = {
            'name': $('#new-activity-name').val()
        };

        $.ajax('/api/activity', {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(packet),
            success: function(data) {
                $('#new-activity-modal').modal('hide');
                $(window).trigger('page-handler:set-page', [data['data']['id']]);
            }
        });
    }

    function _load() {
        this.registerEvents([
            {parent: document.body, selector: '#btn-new-activity', type: 'click', fn: function(){
                $('#new-activity-modal').modal('show');
            }},
            {parent: document.body, selector: '#new-activity-add', type: 'click', fn: $.proxy(_createActivity, this)}
        ]);
        // retrieve all the activities
        $.ajax('/api/activity', {
            method: 'GET',
            success: $.proxy(_populateSelect, this)
        });
    }
    return {
        load: _load
    }
}());

var ActivityPage = function() {
    Page.apply(this, arguments);
    this.widgets = {};
};

extend(ActivityPage, Page, function(){
    function _editWidget(e) {
        var widget = this.widgets[$(e.currentTarget).data('widgetId')];
        widget.edit();
    }

    function _deleteWidget(e) {
        var widget = this.widgets[$(e.currentTarget).data('widgetId')];
        var _this = this;
        _confirm('Delete Content', 'Deleting cannot be undone.', function(){
            $.ajax('/api/activity/widgets/'+widget.id, {
                method: 'DELETE',
                success: function(){
                    _this.widgets[widget.id] = null;
                    widget.view.remove();
                    widget = null;
                }
            });
        });
    }

    function _saveWidget(e, id, data) {
        var postData = {'data': data};
        $.ajax('/api/activity/widgets/'+id, {
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(postData)
        });
    }

    function _moveWidget(direction) {
        var postData = {'move': direction};
        return function(e) {
            var widget = this.widgets[$(e.currentTarget).data('widgetId')];
            $.ajax('/api/activity/widgets/'+widget.id, {
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(postData),
                success: function(){
                    if(direction == 'up') {
                        widget.view.after(widget.view.prev());
                    }
                    else {
                        widget.view.next().after(widget.view);
                    }
                }
            });

        }
    }

    function _newWidget() {
        var type = $('#new-widget-type').val();
        var data = $('#new-widget-content').val();
        var packet = {
            'type': type,
            'data': data
        };
        var widget = Widget.create(type, data, null);
        $.ajax('/api/activity/'+this.current_activity+'/'+this.current_step, {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(packet),
            success: $.proxy(function(data) {
                $('#new-widget-modal').modal('hide');
                widget.id = data['data']['id'];
                this.widgets[widget.id] = widget;
                $('#step-content').append(widget.renderView());
            }, this)
        });
    }

    function _load(activityId, s, stepId) {
        if(admin_mode) {
            $('#btn-goto-storyboard').show();
        }
        if(typeof stepId == 'undefined' || stepId == null) {
            stepId = 1;
        }
        this.current_activity = activityId;
        this.current_step = stepId;

        // set up listeners
        this.registerEvents([
            {parent: document.body, selector: '#btn-next-step', type: 'click', fn: function () {
                $(window).trigger('page-handler:set-page', [activityId+'/'+(Number(stepId) + 1)]);
            }},
            {parent: document.body, selector: '#btn-previous-step', type: 'click', fn: function () {
                $(window).trigger('page-handler:set-page', [activityId+'/'+(Number(stepId) - 1)]);
            }},
            {parent: document.body, selector: '.edit-widget', type: 'click', fn: $.proxy(_editWidget, this)},
            {parent: document.body, selector: '.delete-widget', type: 'click', fn: $.proxy(_deleteWidget, this)},
            {parent: document.body, selector: '.move-widget-up', type: 'click', fn: $.proxy(_moveWidget('up'), this)},
            {parent: document.body, selector: '.move-widget-down', type: 'click', fn: $.proxy(_moveWidget('down'), this)},

            {parent: document.body, selector: '#btn-goto-storyboard', type: 'click', fn: function(){
                $(window).trigger('page-handler:set-page', ['/steps/'+activityId])
            }},

            {parent: document.body, selector: '#btn-new-widget', type: 'click', fn: function(){
                $('#new-widget-modal').modal('show');
            }},
            {parent: document.body, selector: '#new-widget-add', type: 'click', fn: $.proxy(_newWidget, this)},
            {type: 'save-widget', fn: $.proxy(_saveWidget, this)},
            {parent: document.body, selector: '#new-widget-type', type: 'change', fn: function(){
                var selected = $(this).find('option:selected');
                if(selected.data('noValue')) {
                    $('#data-area').hide();
                }
                else {
                    $('#data-area').show();
                }
            }}
        ]);

        //get the activity info
        $.ajax('/api/activity/'+activityId+'/'+stepId, {
            method: 'GET',
            success: $.proxy(function(data) {
                var _this = this;
                _this.widgets = {};
                if(typeof data['data']['message'] != 'undefined') {
                    $('#step-content').html(data['data']['message']);
                    $('#btn-previous-step').hide();
                    $('#btn-next-step').hide();
                    return;
                }
                data['data']['widgets'].forEach(function(d){
                    var widget = Widget.create(d['type'], d['data'], d['id']);
                    _this.widgets[d['id']] = widget;
                    $('#step-content').append(widget.renderView());
                });

                if(admin_mode) {
                    $('#new-widget').show();
                }
                if(!data['data']['has_next']) {
                    $('#btn-next-step').hide();
                }
                if(!data['data']['has_previous']) {
                    $('#btn-previous-step').hide();
                }
            }, this)
        })
    }

    function _teardown() {
        $('#btn-goto-storyboard').hide();
    }
    return {
        load: _load,
        teardown: _teardown
    }

}());

ActivityViewer = function(){
    var hash_handler;

    function __init__() {
        hash_handler = new HashHandler('#content');
        hash_handler.addPageHandler(/^(\d+)(:?\/(\d+))?\/?$/, new ActivityPage("/activity_view"));
        if (admin_mode) {
            hash_handler.addPageHandler(/^\/?$/, new NewActivityPage("/activity_admin"));
            hash_handler.addPageHandler(/^\/steps\/(\d+)$/, new StoryboardPage('/activity_admin_steps'));
        }
        else {
            hash_handler.addPageHandler(/^\/?$/, new QuestionViewerPage("/questions"));
            PocketPlayer.init();
        }
        hash_handler.init();

    }
    return {
        init: __init__
    }
}();

 ActivityViewer.init();

function _confirm(title, body, callback) {
    var content = $('<div class="modal fade" id="root-view" tabindex="-1" role="dialog">' +
    '<div class="modal-dialog" role="document">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title" id="myModalLabel">'+title+'</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    body +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="btn gray" data-dismiss="modal">Cancel</button>' +
    '<button type="button" class="btn mint ok">Okay</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>');
    $(document.body).append(content);
    content.modal('show');
    content.find('.ok').on('click', function(){
        content.modal('hide');
        callback();
    });

}
