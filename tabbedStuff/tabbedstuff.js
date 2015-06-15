 /*
  Created by Isaiah Mayerchak on 6/15/15
  */

function RunestoneBase() {  //Parent function

}


RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};

var TSList = {};  //Tabbed Stuff dictionary

TabbedStuff.prototype = new RunestoneBase();

//<div> constructor
function TabbedStuff(opts) {
    if (opts) {
        this.init(opts);
    }
}

TabbedStuff.prototype.init = function(opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;  //entire <div> element
    this.origElem = orig;
    this.divid = orig.id;

    this.togglesList = [];
    this.childTabs = []
    this.populateChildTabs();

    this.createTabs();


}

TabbedStuff.prototype.populateChildTabs = function() {           //Populate this.childTabs with all child nodes that have the data-component="tab" attribute
	for (var i=0; i<this.origElem.childNodes.length; i++) {
    	if ($(this.origElem.childNodes[i]).data('component') == "tab") {
    		this.childTabs.push(this.origElem.childNodes[i]);
    	}
    }
}


TabbedStuff.prototype.createTabs = function() {                  //Create HTML elements to append to DOM
	var replacementDiv = document.createElement('div');
	replacementDiv.id = this.divid;
	$(replacementDiv).addClass("alert alert-warning");

	var tabsUL = document.createElement('ul');
	tabsUL.id = this.divid + "_tab";
	$(tabsUL).addClass('nav nav-tabs');


	var tabContentDiv = document.createElement('div');   	//Create tab content area
	$(tabContentDiv).addClass("tab content");



	//Create tabs in format <li><a><span></span></a></li> to be appended to the <ul>
	for (var i=0; i<this.childTabs.length; i++) {
		//First create tabname and tabfriendly name that has no spaces to be used for the id
		var tabname = $(this.childTabs[i]).data("tabname");
		var temp = tabname.split(" ");
		var tabfriendlyname = temp.join("");

		var tabListElement = document.createElement('li');
		var tabElement = document.createElement('a');

		$(tabElement).attr({
			'data-toggle':'tab',
			'href': '#' + this.divid + "-" + tabfriendlyname
		});
		var tabTitle = document.createElement('span');
		tabTitle.textContent = $(this.childTabs[i]).data("tabname");

		tabElement.appendChild(tabTitle);
		tabListElement.appendChild(tabElement);
		tabsUL.appendChild(tabListElement);
	
		//tabPane is what holds the contents of the tab
		var tabPaneDiv = document.createElement('div');
		tabPaneDiv.id = this.divid + "-" + tabfriendlyname;
		$(tabPaneDiv).addClass("tab-pane");
		var tabHTML = $(this.childTabs[i]).html();
		$(tabPaneDiv).html(tabHTML);

		this.togglesList.push(tabElement);

		tabContentDiv.appendChild(tabPaneDiv);

	}

	replacementDiv.appendChild(tabsUL);
	replacementDiv.appendChild(tabContentDiv);



	console.log($(this.togglesList));

	$(this.togglesList).click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        })

        // activate the first tab
        var el = $(this.togglesList)[0];
        $(el).tab('show');

        $(this.togglesList).on('shown.bs.tab', function (e) {
            var content_div = $(e.target.attributes.href.value);
            content_div.find('.disqus_thread_link').each(function() {
                $(this).click();
            });

            content_div.find('.CodeMirror').each(function(i, el) {
                el.CodeMirror.refresh();
            });
        })

	$(this.origElem).replaceWith(replacementDiv);
}
/*

TABCONTENT_BEGIN = """<div class='tab-content'>"""
TABCONTENT_END = """</div>"""

TABDIV_BEGIN = """<div class='tab-pane' id='%(divid)s-%(tabname)s'>"""

TABDIV_END = """</div>""" 
*/
















$(document).ready(function() {
    $('[data-component=tabbedStuff]').each(function(index){
        TSList[this.id] = new TabbedStuff({'orig':this});
    });

});
