var QuestionPage = function(){
    Page.apply(this, arguments);
};

extend(QuestionPage, Page, function(){
    var questionInputs = [
        '#new-question-prompt', '#new-question-often', '#new-question-sometimes', '#new-question-rarely',
        '#new-question-activity', '#new-question-category', '#new-question-id', '#new-question-positive'
    ];

    function _newCategory() {
        $('#new-category-modal').modal('show');
    }

    function _addCategory() {
        var packet = {'title': $('#new-category-title').val()};

        $.ajax('/api/categories', {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(packet),
            success: function(data) {
                _drawCategory([data['data']]);
                $('#new-category-title').val('');
                $('#new-widget-modal').modal('hide');
            }
        })
    }

    function _newQuestion(e) {
        var target = $(e.currentTarget);

        if(target.hasClass('question')) {
            $.ajax('/api/questions/'+target.data('id'), {
                method: 'GET',
                success: function(data){
                    questionInputs.forEach(function(selector){
                        var s = $(selector);
                        if(s.attr('type') == 'checkbox') {
                            s.prop('checked', data['data'][s.attr('name')]);
                        }
                        else {
                            s.val(data['data'][s.attr('name')]);
                        }
                    });
                    $('#new-question-add').html('Save');
                    $('#new-question-modal').modal('show');
                }
            });
        }
        else {
            questionInputs.forEach(function(selector){
                $(selector).val('');
            });
            $('#new-question-add').html('Add');
            $('#new-question-modal').modal('show');
        }
        $('#new-question-category').val(target.data('forCategory'));
    }

    function _addQuestion() {
        var url = '/api/questions';
        var method = 'POST';
        var editing = false;
        var packet = {};
        questionInputs.forEach(function(selector){
            var s = $(selector);
            var value = s.val();
            if(s.attr('type') == 'checkbox') {
                value = s.is(':checked');
            }
            packet[s.attr('name')] = value;
        });
        if(packet['activity_id'] == "null") { // no activity assigned
            delete packet['activity_id'];
        }
        if(packet['id'] != '') {
            // we want to edit it instead
            editing = true;
            url += '/'+packet['id'];
            method = 'PUT';
        }
        // no need to post the id, as it will be a part of the URL
        delete packet['id'];
        $.ajax(url, {
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(packet),
            success: function(data){
                questionInputs.forEach(function(selector){
                    $(selector).val('');
                });
                $('#new-question-modal').modal('hide');
                if (!editing) {
                    $('#category-list').children().each(function () {
                        if ($(this).data('id') == data['data']['category_id']) {
                            // insert it before the "add question" button
                            $(this).find('.question-list').last().before('<div class="question" data-id="' + data['data']['id'] + '">' +
                                data['data']['prompt'] + '</div>');
                        }
                    });
                }
            }
        })
    }

    function _drawCategory(categories) {
        // structure {id: , title:, questions: [{id:, prompt:}]
        categories.forEach(function(category) {
            var view = '<div class="question-category" data-id="' + category['id'] + '">' +
                    '<span>' + category['title'] + '</span>' +
                    '<div class="question-list">'
                ;
            category['questions'].forEach(function (question) {
                view += '<div class="question" data-id="' + question['id'] + '">' +
                    question['prompt'] +
                    '</div>';
            });
            view += '<button data-for-category="'+category['id']+'" class="btn btn-default new-question">New Question...</button></div>';
            $('#category-list').append(view);
        });
    }
    function _load() {

        this.registerEvents([
            {parent: document.body, selector: '.new-category', type: 'click', fn: _newCategory},
            {parent: document.body, selector: '.new-question', type: 'click', fn: _newQuestion},
            {parent: document.body, selector: '.question', type: 'click', fn: _newQuestion},
            {parent: document.body, selector: '#new-category-add', type: 'click', fn: $.proxy(_addCategory, this)},
            {parent: document.body, selector: '#new-question-add', type: 'click', fn: $.proxy(_addQuestion, this)}
        ]);

        var _this = this;
        $.ajax('/api/categories', {
            method: 'GET',
            success: function(data){
                    _drawCategory.call(_this, data['data']);
            }
        })
    }

    return {
        load: _load
    }
}());

var QuestionEditor = function(){
    var hash_handler;

    function __init__() {
        hash_handler = new HashHandler('#content');
        hash_handler.addPageHandler(/^\/?$/, new QuestionPage("/questions/edit/list"));
        hash_handler.init();
    }
    return {
        init: __init__
    }
}();

$(document).ready(function(){
    QuestionEditor.init();
});
