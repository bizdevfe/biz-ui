#BizUI Framework

[![Code Climate](https://codeclimate.com/github/bizdevfe/biz-ui/badges/gpa.svg)](https://codeclimate.com/github/bizdevfe/biz-ui)
[![Build Status](https://travis-ci.org/bizdevfe/biz-ui.svg?branch=master)](https://travis-ci.org/bizdevfe/biz-ui)

BizUI is a jQuery plugin for business UI components, have a [quick view](http://bizdevfe.github.io/biz-ui/quick-view.html):

<img src="http://bizdevfe.github.io/biz-ui/img/demo.png" />

##Features
* Include 14 types of UI components: Button, Input, Textarea, Radio, Checkbox, Select, Dialog, Panel, Tooltip, Tab, Page, Tree, Calendar, Table.
* IE9+, Firefox, Chrome, Safari and Opera supported.
* Import other awesome components with the constant API using Adapter Pattern.

<img src="http://bizdevfe.github.io/biz-ui/img/adapter.png" />

##Usage
Download the latest version: [https://github.com/bizdevfe/biz-ui/releases](https://github.com/bizdevfe/biz-ui/releases).

Together with jQuery, include bizui.js in your page:

    <script src="jquery.js" type="text/javascript"></script>
    <script src="jquery.bizui.js" type="text/javascript"></script>

jQuery 2.x or later is recommended. Older versions might work as well, but they are not tested.

Include the CSS file:

    <link href="jquery.bizui.css" rel="stylesheet" type="text/css" />

You can also load jquery.bizui.js as a AMD module:

    var bizui = require('jquery.bizui');

To initialize:

    // recommended
	$('button').bizButton();
	
	// or create instance by constructor
	var button = new bizui.Button($('button'));

##API documentation and demos
See [http://bizdevfe.github.io/biz-ui](http://bizdevfe.github.io/biz-ui).

##Build
Do the code inspection, optimization or API generation here:

    $ cd tool
    $ build.sh

##License
Licensed under the [MIT license](http://opensource.org/licenses/MIT).

##Feedback
For issues or suggestions please see [biz-ui](https://github.com/bizdevfe/biz-ui) on Github. Thanks for your support!