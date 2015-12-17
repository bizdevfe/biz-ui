/**
 * Tree
 */
var menuData = [{
    id: 100,
    text: 'Dashbord',
    icon: false
}, {
    id: 200,
    text: 'Consumption',
    icon: false,
    children: [{
        id: 210,
        text: 'PC'
    }, {
        id: 220,
        text: 'Mobile'
    }],
    state: {
        opened: true
    }
}, {
    id: 300,
    text: 'Report',
    icon: false,
    children: [{
        id: 310,
        text: 'Daily'
    }, {
        id: 320,
        text: 'Weekly'
    }, {
        id: 330,
        text: 'Monthly'
    }]
}, {
    id: 400,
    text: 'Settings',
    icon: false,
    children: [{
        id: 410,
        text: 'Profile'
    }, {
        id: 420,
        text: 'Security'
    }]
}];
$('#menu').on("loaded.jstree", function(e, data) {
    data.instance.select_node(210);
}).bizTree({
    core: {
        data: menuData
    },
    plugins: ['wholerow']
});

/**
 * Region Content
 */
$('#region').bizSelect();
$('#range').bizCalendar({
    startDate: '2010-01-01',
    endDate: '2020-12-31',
    language: 'en'
});

/**
 * Client Content
 */
$('#client').bizSelect();
$('#keyword').bizInput();
$('input[name="vip"]').bizCheckbox();
$('input[name="client"]').bizRadio();

/**
 * Tabs
 */
$('#dimension').bizTab({
    onChange: function(data) {
        $('.data').bizTable('updateData', data.index === 0 ? data1 : data2);
    }
});

/**
 * Button
 */
$('#add').bizButton().click(function() {
    $('#panel').bizPanel('open');
});
$('#query').bizButton({
    theme: 'dark'
});
$('#filter').bizButton();

$('#filterContext').bizDDContext({
    trigger: $('#filter'),
    // offsetX: -50,
    // offsetY: -47,
    // delay: 2000,
    alignY: 'bottom',
    alignX: 'left',
    onBeforeOpen: function() {
        $('#input1').val('');
        $('#input2').val('');
        $('#input3').val('');
        $('#input4').val('');
        $('#input5').val('');
    },
    onBeforeClose: function(){
        return confirm('close?')
    }
})

$('#submit').bizButton().click(function(){
    alert('Name = ' + $('#input1').val() + '\n' + 'Height = ' + $('#input2').val() + '\n' + 'Weight = ' + $('#input3').val() + '\n' + 'Age = ' + $('#input4').val() + '\n' + 'Email = ' + $('#input5').val() )
});

$('#cancel').bizButton().click(function(){
    $('#filterContext').bizDDContext('close');
});

/**
 * Table
 */
function getAverage(data, field) {
    var sum = 0;
    $.each(data, function(index, val) {
        sum = sum + (val[field] - 0);
    });
    return Math.round(sum / data.length);
}

var column = [{
    field: 'no',
    title: 'No.',
    width: 70,
    content: function(item, index, field) {
        return index;
    },
    footContent: function(field) {
        return 'Average';
    }
}, {
    field: 'name',
    title: 'Name',
    width: 100,
    content: [
        function(item, index, field) {
            return item.name;
        },
        function(item, index, field) {
            return item.id;
        },
        function(item, index, field) {
            return field;
        }
    ]
}, {
    field: 'height',
    title: 'Height(cm)',
    editable: true,
    sortable: true,
    currentSort: 'des',
    align: 'right',
    width: 120,
    content: function(item, index, field) {
        return item.height;
    },
    footContent: function(field) {
        return getAverage(this.getData(), field);
    }
}, {
    field: 'weight',
    title: 'Weight(kg)',
    editable: true,
    sortable: true,
    align: 'right',
    width: 120,
    content: function(item, index, field) {
        return item.weight;
    },
    footContent: function(field) {
        return getAverage(this.getData(), field);
    }
}, {
    field: 'age',
    title: 'Age',
    sortable: true,
    align: 'right',
    width: 120,
    content: function(item, index, field) {
        return item.age;
    },
    footContent: function(field) {
        return getAverage(this.getData(), field);
    }
}, {
    field: 'email',
    title: 'Email',
    editable: true,
    width: 200,
    content: function(item, index, field) {
        return item.email;
    }
}, {
    field: 'op',
    title: 'Operation',
    escapeContent: false,
    width: 100,
    content: function(item, index, field) {
        return '<a href="#" id="' + item.id + '">Detail</a>';
    },
    visible: false
}];

var data1 = [{
    id: 100,
    name: 'A',
    height: 182,
    weight: 60.5,
    age: 25,
    email: 'a@sogou.com'
}, {
    id: 200,
    name: 'B',
    height: 173,
    weight: 50.2,
    age: 26,
    email: 'b@sogou.com'
}, {
    id: 300,
    name: 'C',
    height: 170,
    weight: 62.6,
    age: 27,
    email: 'c@sogou.com'
}, {
    id: 400,
    name: 'D',
    height: 165,
    weight: 70.3,
    age: 23,
    email: 'd@sogou.com'
}];

var data2 = [{
    id: 500,
    name: 'E',
    height: 178,
    weight: 56.1,
    age: 30,
    email: 'e@sogou.com'
}, {
    id: 600,
    name: 'F',
    height: 171,
    weight: 52.2,
    age: 28,
    email: 'f@sogou.com'
}, {
    id: 700,
    name: 'G',
    height: 168,
    weight: 75.8,
    age: 29,
    email: 'g@sogou.com'
}, {
    id: 800,
    name: 'H',
    height: 160,
    weight: 72.9,
    age: 27,
    email: 'h@sogou.com'
}];

$('.data').bizTable({
    column: column,
    data: data1,
    noDataContent: '<p>No data</p>',
    foot: 'top',
    skin: 'myTable',
    selectable: true,
    resizable: true,
    lockHead: true,
    onSort: function(data, e) {
        console.log(data);
    },
    onSelect: function(data, e) {
        console.log(data);
    },
    onValidate: function(data, e) {
        switch (data.field) {
            case 'height':
                return /^\d+$/.test(data.newValue);
            case 'weight':
                return /^\d+(\.)?\d+$/.test(data.newValue);
        }
    },
    onEdit: function(data, e) {
        console.log(data);
    }
});

/**
 * Page
 */
$('.page-size').bizSelect().change(function(e) {
    $('.page').bizPage('setPageSize', e.target.value);
});
$('.page').bizPage({
    pageSize: 10,
    pageNumber: 1,
    totalNumber: 200
});
$('.page-number').bizInput({
    onEnter: go
});
$('.go').bizButton().click(go);

function go() {
    var value = parseInt($('.page-number').val(), 10),
        pageCount = $('.page').bizPage('getPageCount');

    if (/^\d+$/.test(value) && value > 0 && value <= pageCount) {
        $('.page').bizPage('setPageNumber', value);
        $('.page-number').val('');
    } else {
        $('.page-number').focus();
    }
}

/**
 * Panel & Dialog
 */
$('#panel').bizPanel({
    buttons: [{
        text: 'Add',
        click: function() {
            var name = $.trim($('#name').val()),
                panel = this;
            if (name === '') {
                bizui.Dialog.alert({
                    title: 'Wanning',
                    content: 'Region name required!',
                    ok: 'OK'
                });
            } else {
                bizui.Dialog.confirm({
                    title: 'Confirmation',
                    content: 'Add new region?',
                    ok: 'Yes',
                    cancel: 'No',
                    onOK: function() {
                        panel.close();
                    }
                });
            }
        }
    }, {
        text: 'Canel',
        click: function() {
            this.close();
        },
        theme: 'dark'
    }]
});
$('#name').bizInput();
$('#description').bizTextarea();
$('#effective').bizCalendar({
    startDate: new Date(),
    language: 'en'
});

/**
 * Tooltip
 */
bizui.Tooltip({
    margin: 8
});