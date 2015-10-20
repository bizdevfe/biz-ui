Ext.data.JsonP.Table({"tagname":"class","name":"Table","autodetected":{},"files":[{"filename":"Table.js","href":"Table.html#Table"}],"members":[{"name":"$main","tagname":"property","owner":"Table","id":"property-S-main","meta":{}},{"name":"main","tagname":"property","owner":"Table","id":"property-main","meta":{}},{"name":"constructor","tagname":"method","owner":"Table","id":"method-constructor","meta":{}},{"name":"bindEdit","tagname":"method","owner":"Table","id":"method-bindEdit","meta":{"protected":true}},{"name":"bindSelect","tagname":"method","owner":"Table","id":"method-bindSelect","meta":{"protected":true}},{"name":"bindSort","tagname":"method","owner":"Table","id":"method-bindSort","meta":{"protected":true}},{"name":"bindValidate","tagname":"method","owner":"Table","id":"method-bindValidate","meta":{"protected":true}},{"name":"createFoot","tagname":"method","owner":"Table","id":"method-createFoot","meta":{"protected":true}},{"name":"createSelect","tagname":"method","owner":"Table","id":"method-createSelect","meta":{"protected":true}},{"name":"createTable","tagname":"method","owner":"Table","id":"method-createTable","meta":{"protected":true}},{"name":"destroy","tagname":"method","owner":"Table","id":"method-destroy","meta":{}},{"name":"escapeHTML","tagname":"method","owner":"Table","id":"method-escapeHTML","meta":{"protected":true}},{"name":"getData","tagname":"method","owner":"Table","id":"method-getData","meta":{}},{"name":"getSelected","tagname":"method","owner":"Table","id":"method-getSelected","meta":{}},{"name":"getSelectedIndex","tagname":"method","owner":"Table","id":"method-getSelectedIndex","meta":{"protected":true}},{"name":"hideColumn","tagname":"method","owner":"Table","id":"method-hideColumn","meta":{}},{"name":"init","tagname":"method","owner":"Table","id":"method-init","meta":{"protected":true}},{"name":"refresh","tagname":"method","owner":"Table","id":"method-refresh","meta":{"protected":true}},{"name":"setColumnVisible","tagname":"method","owner":"Table","id":"method-setColumnVisible","meta":{"protected":true}},{"name":"setSelected","tagname":"method","owner":"Table","id":"method-setSelected","meta":{}},{"name":"showColumn","tagname":"method","owner":"Table","id":"method-showColumn","meta":{}},{"name":"updateCell","tagname":"method","owner":"Table","id":"method-updateCell","meta":{}},{"name":"updateData","tagname":"method","owner":"Table","id":"method-updateData","meta":{}},{"name":"updateRow","tagname":"method","owner":"Table","id":"method-updateRow","meta":{}},{"name":"updateScroll","tagname":"method","owner":"Table","id":"method-updateScroll","meta":{"protected":true}}],"alternateClassNames":[],"aliases":{},"id":"class-Table","classIcon":"icon-class","superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/Table.html#Table' target='_blank'>Table.js</a></div></pre><div class='doc-contents'><p>Table constructor</p>\n\n<iframe width=\"100%\" height=\"350\" src=\"//jsfiddle.net/bizdevfe/q4myap58/34/embedded/result,js,html/\" frameborder=\"0\"></iframe>\n\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-S-main' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-property-S-main' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-property-S-main' class='name expandable'>$main</a> : jQuery<span class=\"signature\"></span></div><div class='description'><div class='short'><p><code>table</code>元素的$包装</p>\n</div><div class='long'><p><code>table</code>元素的$包装</p>\n</div></div></div><div id='property-main' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-property-main' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-property-main' class='name expandable'>main</a> : HTMLElement<span class=\"signature\"></span></div><div class='description'><div class='short'><p><code>table</code>元素</p>\n</div><div class='long'><p><code>table</code>元素</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/Table-method-constructor' class='name expandable'>Table</a>( <span class='pre'>table, options</span> ) : <a href=\"#!/api/Table\" rel=\"Table\" class=\"docClass\">Table</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>table</span> : HTMLElement|jQuery<div class='sub-desc'><p>目标元素</p>\n</div></li><li><span class='pre'>options</span> : Object<div class='sub-desc'><p>参数</p>\n<ul><li><span class='pre'>skin</span> : String (optional)<div class='sub-desc'><p>皮肤类名</p>\n</div></li><li><span class='pre'>column</span> : Array<div class='sub-desc'><p>列配置</p>\n<ul><li><span class='pre'>field</span> : String<div class='sub-desc'><p>表头字段名</p>\n</div></li><li><span class='pre'>title</span> : String<div class='sub-desc'><p>表头文字</p>\n</div></li><li><span class='pre'>content</span> : Array<div class='sub-desc'><p>单元格内容(拆分单元格内容: hover失效, editable失效)</p>\n</div></li><li><span class='pre'>footContent</span> : Function (optional)<div class='sub-desc'><p>总计行内容</p>\n</div></li><li><span class='pre'>escapeTitle</span> : Boolean (optional)<div class='sub-desc'><p>转义表头文字, 默认true</p>\n</div></li><li><span class='pre'>escapeContent</span> : Boolean (optional)<div class='sub-desc'><p>转义单元格内容, 默认true</p>\n</div></li><li><span class='pre'>sortable</span> : Boolean (optional)<div class='sub-desc'><p>是否排序, 默认false</p>\n</div></li><li><span class='pre'>currentSort</span> : String (optional)<div class='sub-desc'><p>des-降序, asc-升序, sortable为true时生效</p>\n</div></li><li><span class='pre'>editable</span> : Boolean (optional)<div class='sub-desc'><p>是否编辑, 默认false</p>\n</div></li><li><span class='pre'>width</span> : Number (optional)<div class='sub-desc'><p>宽度</p>\n</div></li><li><span class='pre'>align</span> : Number (optional)<div class='sub-desc'><p>left-居左, right-居中, center-居右</p>\n</div></li><li><span class='pre'>visible</span> : Boolean (optional)<div class='sub-desc'><p>是否显示, 默认true</p>\n</div></li></ul></div></li><li><span class='pre'>data</span> : Array<div class='sub-desc'><p>数据</p>\n</div></li><li><span class='pre'>foot</span> : String (optional)<div class='sub-desc'><p>总计行, top-顶部, bottom-底部</p>\n</div></li><li><span class='pre'>selectable</span> : Boolean (optional)<div class='sub-desc'><p>是否含勾选列</p>\n</div></li><li><span class='pre'>resizable</span> : Boolean (optional)<div class='sub-desc'><p>是否可调整列宽</p>\n</div></li><li><span class='pre'>onSort</span> : Function (optional)<div class='sub-desc'><p>排序回调, onSort(data, event)</p>\n</div></li><li><span class='pre'>onSelect</span> : Function (optional)<div class='sub-desc'><p>勾选回调, onSelect(data, event)</p>\n</div></li><li><span class='pre'>onEdit</span> : Function (optional)<div class='sub-desc'><p>编辑单元格回调, onEdit(data, event)</p>\n</div></li><li><span class='pre'>onValidate</span> : Function (optional)<div class='sub-desc'><p>验证回调, onValidate(data, event)</p>\n</div></li></ul></div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Table\" rel=\"Table\" class=\"docClass\">Table</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-bindEdit' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-bindEdit' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-bindEdit' class='name expandable'>bindEdit</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>绑定编辑事件 ...</div><div class='long'><p>绑定编辑事件</p>\n</div></div></div><div id='method-bindSelect' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-bindSelect' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-bindSelect' class='name expandable'>bindSelect</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>创建Checkbox控件 ...</div><div class='long'><p>创建Checkbox控件</p>\n</div></div></div><div id='method-bindSort' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-bindSort' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-bindSort' class='name expandable'>bindSort</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>绑定排序事件 ...</div><div class='long'><p>绑定排序事件</p>\n</div></div></div><div id='method-bindValidate' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-bindValidate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-bindValidate' class='name expandable'>bindValidate</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>绑定验证事件 ...</div><div class='long'><p>绑定验证事件</p>\n</div></div></div><div id='method-createFoot' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-createFoot' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-createFoot' class='name expandable'>createFoot</a>( <span class='pre'>options</span> ) : String<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>创建总计行 ...</div><div class='long'><p>创建总计行</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-createSelect' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-createSelect' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-createSelect' class='name expandable'>createSelect</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>创建Checkbox控件 ...</div><div class='long'><p>创建Checkbox控件</p>\n</div></div></div><div id='method-createTable' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-createTable' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-createTable' class='name expandable'>createTable</a>( <span class='pre'>options</span> ) : String<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>创建表格 ...</div><div class='long'><p>创建表格</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-destroy' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-destroy' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-destroy' class='name expandable'>destroy</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>销毁 ...</div><div class='long'><p>销毁</p>\n</div></div></div><div id='method-escapeHTML' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-escapeHTML' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-escapeHTML' class='name expandable'>escapeHTML</a>( <span class='pre'>str</span> ) : String<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>转义HTML ...</div><div class='long'><p>转义HTML</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>str</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getData' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-getData' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-getData' class='name expandable'>getData</a>( <span class='pre'></span> ) : Array<span class=\"signature\"></span></div><div class='description'><div class='short'>获取列表数据 ...</div><div class='long'><p>获取列表数据</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Array</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getSelected' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-getSelected' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-getSelected' class='name expandable'>getSelected</a>( <span class='pre'></span> ) : Array<span class=\"signature\"></span></div><div class='description'><div class='short'>获取勾选行数据 ...</div><div class='long'><p>获取勾选行数据</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Array</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getSelectedIndex' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-getSelectedIndex' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-getSelectedIndex' class='name expandable'>getSelectedIndex</a>( <span class='pre'></span> ) : Array<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>获取勾选行序号 ...</div><div class='long'><p>获取勾选行序号</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Array</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-hideColumn' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-hideColumn' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-hideColumn' class='name expandable'>hideColumn</a>( <span class='pre'>field</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>隐藏列 ...</div><div class='long'><p>隐藏列</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : String|Array<div class='sub-desc'><p>列字段</p>\n</div></li></ul></div></div></div><div id='method-init' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-init' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-init' class='name expandable'>init</a>( <span class='pre'>[options]</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>初始化 ...</div><div class='long'><p>初始化</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>options</span> : Object (optional)<div class='sub-desc'><p>参数</p>\n</div></li></ul></div></div></div><div id='method-refresh' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-refresh' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-refresh' class='name expandable'>refresh</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>刷新表格 ...</div><div class='long'><p>刷新表格</p>\n</div></div></div><div id='method-setColumnVisible' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-setColumnVisible' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-setColumnVisible' class='name expandable'>setColumnVisible</a>( <span class='pre'>field, visible</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>设置列显隐 ...</div><div class='long'><p>设置列显隐</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : String|Array<div class='sub-desc'><p>列字段</p>\n</div></li><li><span class='pre'>visible</span> : Boolean<div class='sub-desc'><p>列字段</p>\n</div></li></ul></div></div></div><div id='method-setSelected' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-setSelected' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-setSelected' class='name expandable'>setSelected</a>( <span class='pre'>rowIndex, selected</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>设置勾选状态 ...</div><div class='long'><p>设置勾选状态</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rowIndex</span> : Number|Array<div class='sub-desc'><p>行号, 0表示全部</p>\n</div></li><li><span class='pre'>selected</span> : Boolean<div class='sub-desc'><p>勾选状态</p>\n</div></li></ul></div></div></div><div id='method-showColumn' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-showColumn' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-showColumn' class='name expandable'>showColumn</a>( <span class='pre'>field</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>显示列 ...</div><div class='long'><p>显示列</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : String|Array<div class='sub-desc'><p>列字段</p>\n</div></li></ul></div></div></div><div id='method-updateCell' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-updateCell' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-updateCell' class='name expandable'>updateCell</a>( <span class='pre'>rowIndex, field, data</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>更新单元格数据 ...</div><div class='long'><p>更新单元格数据</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rowIndex</span> : Number<div class='sub-desc'><p>行号</p>\n</div></li><li><span class='pre'>field</span> : String<div class='sub-desc'><p>列字段</p>\n</div></li><li><span class='pre'>data</span> : Mixed<div class='sub-desc'><p>单元格数据</p>\n</div></li></ul></div></div></div><div id='method-updateData' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-updateData' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-updateData' class='name expandable'>updateData</a>( <span class='pre'>data</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>更新列表数据 ...</div><div class='long'><p>更新列表数据</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>data</span> : Array<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateRow' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-updateRow' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-updateRow' class='name expandable'>updateRow</a>( <span class='pre'>rowIndex, data</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>更新列数据 ...</div><div class='long'><p>更新列数据</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rowIndex</span> : Number<div class='sub-desc'><p>行号</p>\n</div></li><li><span class='pre'>data</span> : Object<div class='sub-desc'><p>行数据</p>\n</div></li></ul></div></div></div><div id='method-updateScroll' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Table'>Table</span><br/><a href='source/Table.html#Table-method-updateScroll' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Table-method-updateScroll' class='name expandable'>updateScroll</a>( <span class='pre'></span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>刷新滚条 ...</div><div class='long'><p>刷新滚条</p>\n</div></div></div></div></div></div></div>","meta":{}});