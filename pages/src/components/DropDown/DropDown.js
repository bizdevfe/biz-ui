var DropDown = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .dropdown').parent().addClass('active');

        var view = this;
        $.get('src/components/DropDown/dropdown.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('input').bizInput();
        $('#b1').bizButton({
            theme: 'blue-gray'
        });
        $('#b2').bizButton();
        $('.dropdown-container').bizDropDown({
            trigger: '#b1',
            customClass: 'register'
        });
        $('#b2').click(function() {
            $('.dropdown-container').bizDropDown('close');
        });
	},

    destroy: function() {
        $('.dropdown-container').bizDropDown('destroy');
        this.$el.empty();
    }
});
