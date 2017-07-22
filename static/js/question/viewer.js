var QuestionViewerPage = function(){
    Page.apply(this, arguments);
};

extend(QuestionViewerPage, Page, function() {

    var responses = ['sometimes', 'often', 'rarely'];
    var current_activity_id;
    var current_is_positive;

    function construct_question(category_title, question) {
        // {prompt:, text_often:, text_sometimes:, text_rarely:, is_positive:}

        // make a container for it
        var div = $('<p>'+question['prompt']+'</p>');
        div.on('click', function(){
            $('#question-area').show();
            $('#category-title').html(category_title);
            $('#question-prompt').html(question['prompt']);
            $('#question-response-text-often').html(question['text_often']);
            $('#question-response-text-sometimes').html(question['text_sometimes']);
            $('#question-response-text-rarely').html(question['text_rarely']);
            current_activity_id = question['activity_id'];
            current_is_positive = question['is_positive'];
        });
        return div;
    }

    function _show(type) {
        return function() {
            responses.forEach(function(response){
                if(response == type) {
                    $('#question-response-text-'+response).show();
                }
                else {
                    $('#question-response-text-'+response).hide();
                }
                if((response == 'rarely' && current_is_positive) || (response == 'often' && !current_is_positive)) {
                    $('#question-ok').hide();
                    // redirect to activity
                    setTimeout(function(){
                        $('#question-response-modal').on('hidden.bs.modal', function(){
                            $(window).trigger('page-handler:set-page', [''+current_activity_id]);
                        }).modal('hide');

                    }, 5000);

                }
                else {
                    $('#question-ok').show();
                }
            });
            $('#question-response-modal').modal('show');
        }
    }

    function _load() {
        this.registerEvents([
            {parent: document.body, selector: '#btn-often', type: 'click', fn: _show('often')},
            {parent: document.body, selector: '#btn-sometimes', type: 'click', fn: _show('sometimes')},
            {parent: document.body, selector: '#btn-rarely', type: 'click', fn: _show('rarely')}
        ]);
        // load all the categories and the questions
        $.ajax('/api/questions/view', {
            method: 'GET',
            success: function(data){
                // categories
                data['data'].forEach(function(category){
                    var categoryView = $('<div></div>');
                    category['questions'].forEach(function(question){
                        categoryView.append(construct_question(category['title'], question));
                    });
                    $('#question-list').append(categoryView);
                });
            }
        })
    }

    function _teardown() {
    }
    return {
        load: _load,
        teardown: _teardown
    }
}());