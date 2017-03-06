var Table = Backbone.View.extend({
    el: '.main',

    render: function() {
        $('aside .table').parent().addClass('active');

        var view = this;
        $.get('src/components/Table/table.html', function(tpl) {
            view.$el.html(Mustache.render(tpl));
			view.initBizUI();
			hljs.initHighlighting.called = false;
			hljs.initHighlighting();
        });
    },

	initBizUI: function() {
        function getAverage(data, field) {
            var sum = 0;
            $.each(data, function(index, val) {
                sum = sum + (val[field] - 0);
            });
            return Math.round(sum / data.length);
        }

        var data = [
            {id: 100, name: 'Alice', height: 182, weight: 60.5, age: 25, email: 'alice@sogou.com'},
            {id: 200, name: 'Betty', height: 173, weight: 50.2, age: 26, email: 'betty@sogou.com'},
            {id: 300, name: 'Christina', height: 170, weight: 62.6, age: 27, email: 'christina@sogou.com', disabledSelect: true},
            {id: 400, name: 'Daphne', height: 165, weight: 70.3, age: 23, email: 'daphne@sogou.com'}
        ];

        var column = [
            {
                width: 70,
                field: 'no',
                title: 'No.',
                align: 'center',
                content: function(item, index, field) {
                    return index;
                },
                footContent: function(field) {
                    return 'Average';
                }
            },
            {
                width: 120,
                field: 'name',
                title: 'Name',
                content: [
                    function(item, index, field) {
                        return item.id;
                    },
                    function(item, index, field) {
                        return item.name;
                    }
                ]
            },
            {
                width: 120,
                field: 'height',
                title: 'Height <i>(cm)</i>',
                escapeTitle: false,
                sortable: true,
                currentSort: 'des',
                editable: true,
                align: 'right',
                content: function(item, index, field) {
                    return item.height;
                },
                footContent: function(field) {
                    return getAverage(this.getData(), field);
                }
            },
            {
                width: 120,
                field: 'weight',
                title: 'Weight <i>(kg)</i>',
                escapeTitle: false,
                sortable: true,
                editable: true,
                align: 'right',
                content: function(item, index, field) {
                    return item.weight;
                },
                footContent: function(field) {
                    return getAverage(this.getData(), field);
                }
            },
            {
                width: 120,
                field: 'age',
                title: 'Age',
                sortable: true,
                align: 'right',
                content: function(item, index, field) {
                    return item.age;
                },
                footContent: function(field) {
                    return getAverage(this.getData(), field);
                }
            },
            {
                width: 180,
                field: 'email',
                title: 'Email',
                editable: true,
                content: [
                    function(item, index, field) {
                        return item.id;
                    },
                    function(item, index, field) {
                        return item.email;
                    }
                ]
            },
            {
                width: 120,
                field: 'op',
                title: 'Operation',
                escapeContent: false,
                content: function(item, index, field) {
                    return '<a href="javascript:void(0)" id="' + item.id + '">Detail</a>';
                }
            }
        ];

        $('.list').bizTable({
            column: column,
            data: data,
            foot: 'top',
            selectable: true,
            onSelect: function(data) {
                console.log(data);
            },
            onSort: function(data) {
                console.log(data);
            },
            lockHead: true,
            topOffset: 51,
            onValidate: function(data) {
                console.log(data);
                switch (data.field) {
                    case 'height': return /^\d+$/.test(data.newValue);
                    case 'weight': return /^\d+(\.)?\d+$/.test(data.newValue);
                }
            },
            onEdit: function(data) {
                console.log('Success', data);
                this.refresh();
            },
            onFailEdit: function(data) {
                console.log('Fail', data);
            }
        });
	},

    destroy: function() {
        $('.list').bizTable('destroy');
        this.$el.empty();
    }
});
