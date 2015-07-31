#BizUI Framework

###A jQuery plugin for business UI components.

[![Code Climate](https://codeclimate.com/github/bizdevfe/biz-ui/badges/gpa.svg)](https://codeclimate.com/github/bizdevfe/biz-ui)
[![Build Status](https://travis-ci.org/bizdevfe/biz-ui.svg?branch=master)](https://travis-ci.org/bizdevfe/biz-ui)

##Features
* Include 14 types of UI components: Button.
* IE9+, Firefox, Chrome, Safari and Opera supported.

##Usage
Download the latest version: [https://github.com/bizdevfe/biz-ui/releases](https://github.com/bizdevfe/biz-ui/releases).

Together with jQuery, include bizui.js in your page:

    <script src="jquery.js" type="text/javascript"></script>
    <script src="bizui.js" type="text/javascript"></script>

jQuery 2.x or later is recommended. Older versions might work as well, but they are not tested.

Include the CSS file:

    <link href="bizui.css" rel="stylesheet" type="text/css" />

You can also load bizui.js as a AMD module:

    var bizui = require('bizui');

To initialize:

    // recommended
	$('button').bizButton();
	
	// or create instance by constructor
	var button = new bizui.Button($('button'));

##API documentation and examples
See [http://bizdevfe.github.io/biz-ui](http://bizdevfe.github.io/biz-ui).

##Build
    $ cd tool
    $ build.sh

##License
Licensed under the [MIT license](http://opensource.org/licenses/MIT).

##Feedback
For issues or suggestions please see [biz-ui](https://github.com/bizdevfe/biz-ui) on Github. Thanks for your support!