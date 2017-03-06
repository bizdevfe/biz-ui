var Calendar = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .calendar').parent().addClass('active');

        var view = this;
        $.get('src/components/Calendar/calendar.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        $('input').bizInput();
        $('.date').bizCalendar({
            daysOfWeekHighlighted: '06',
            todayBtn: true,
            todayHighlight: true
        });
        $('.input-daterange').bizCalendar({
            startDate: new Date('2000-01-01'),
            endDate: '2046-12-31'
        });
        $('.inline-date').bizCalendar({
            templates: {
                leftArrow: '<i class="biz-icon">&#xe314;</i>',
                rightArrow: '<i class="biz-icon">&#xe315;</i>'
            },
            theme: 'light-green'
        }).on('changeDate', function(e) {
            $('.log').html(e.format());
        });
	},

    destroy: function() {
        $('input').bizInput('destroy');
        $('input').datepicker('destroy');
        $('.inline-date').datepicker('destroy');
        this.$el.empty();
    }
});
