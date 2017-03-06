var Router = Backbone.Router.extend({
    routes: {
        '': 'button',
        'button': 'button',
        'calendar': 'calendar',
        'checkbox': 'checkbox',
        'dialog': 'dialog',
        'dropdown': 'dropdown',
        'input': 'input',
        'page': 'page',
        'panel': 'panel',
        'radio': 'radio',
        'select': 'select',
        'tab': 'tab',
        'table': 'table',
        'textarea': 'textarea',
        'textline': 'textline',
        'tooltip': 'tooltip',
        'tree': 'tree',
        'treetable': 'treetable'
    },

    initialize: function() {
        S.main = null;
    },

    startRout: function(view) {
        S.main && S.main.destroy && S.main.destroy();
        S.main = view;
        $('aside a').removeClass('active');
        S.main.render();
        window.scrollTo(0, 0);
    },

    button: function() {
        this.startRout(new Button());
    },

    calendar: function() {
        this.startRout(new Calendar());
    },

    checkbox: function() {
        this.startRout(new Checkbox());
    },

    dialog: function() {
        this.startRout(new Dialog());
    },

    dropdown: function() {
        this.startRout(new DropDown());
    },

    input: function() {
        this.startRout(new Input());
    },

    page: function() {
        this.startRout(new Page());
    },

    panel: function() {
        this.startRout(new Panel());
    },

    radio: function() {
        this.startRout(new Radio());
    },

    select: function() {
        this.startRout(new Select());
    },

    tab: function() {
        this.startRout(new Tab());
    },

    table: function() {
        this.startRout(new Table());
    },

    textarea: function() {
        this.startRout(new Textarea());
    },

    textline: function() {
        this.startRout(new Textline());
    },

    tooltip: function() {
        this.startRout(new Tooltip());
    },

    tree: function() {
        this.startRout(new Tree());
    },

    treetable: function() {
        this.startRout(new Treetable());
    }
});
