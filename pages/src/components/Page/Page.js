var Page = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .page').parent().addClass('active');

        var view = this;
        $.get('src/components/Page/page.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        var page = $('.page-nav');
        $('button').bizButton({
            theme: 'blue-gray'
        });
        $('input:text').bizInput();
        $('input:checkbox').bizCheckbox();
        page.bizPage({
            pageSize: 50,
            pageNumber: 1,
            totalNumber: 300
        });
        $('#b1').click(function() {
            page.bizPage('prevPage');
        });
        $('#b2').click(function() {
            page.bizPage('nextPage');
        });
        $('#b3').click(function() {
            page.bizPage('disable');
        });
        $('#b4').click(function() {
            page.bizPage('enable');
        });
        $('#b5').click(function() {
            page.bizPage('setPageNumber', $('.pageNumber').val());
        });
        $('#b6').click(function() {
            page.bizPage('setPageSize', $('.pageSize').val());
        });
        $('#b7').click(function() {
            page.bizPage('setTotalNumber', $('.totalNumber').val(), $('.redaw').prop('checked'));
        });
	},

    destroy: function() {
        $('button').bizButton('destroy').off();
        $('input:text').bizInput('destroy');
        $('input:checkbox').bizCheckbox('destroy');
        $('.page-nav').bizPage('destroy');
        this.$el.empty();
    }
});
