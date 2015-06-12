/*
__author__ = Kirby Olson
__date__ = 6/12/2015  */

var pollList = {};

Poll.prototype = new RunestoneBase();

function Poll(opts) {
	if (opts) {
		this.init(opts);
	}
}

Poll.prototype.init = function (opts) {
	RunestoneBase.apply(this, arguments);
    var orig = opts.orig;  //entire <p> element
    this.origElem = orig;
    this.divid = orig.id;
	this.children = this.origElem.childNodes;
	this.optionList = [];

	this.getQuestionText();
	this.getOptionText();
	this.renderPoll();
}

Poll.prototype.getQuestionText = function() {
	var _this = this;
	for (var i=0; i<this.children.length; i++) {
		if (this.children[i].tagName == "LI") {
			var firstAnswer = _this.children[i];
			break;
		}
	}
    var delimiter = firstAnswer.outerHTML;
    var fulltext = $(this.origElem).html();
    var temp = fulltext.split(delimiter);
    this.question = temp[0];
};

Poll.prototype.getOptionText = function() {
	var _this = this;
	for (var i=0; i<this.children.length; i++) {
		if (_this.children[i].tagName == "LI") {
			_this.optionList.push($(_this.children[i]).text());
		}
	}
}

Poll.prototype.renderPoll = function() {
	var _this = this;
	this.containerDiv = document.createElement('div');
	this.pollForm = document.createElement('form');
	this.resultsDiv = document.createElement('div');


	this.containerDiv.id = this.divid + "_container";
	$(this.containerDiv).addClass("alert alert-warning");

	$(this.pollForm).text(this.question);
	$(this.pollForm).attr({
		"id":this.divid +"_form",
        "method" : "get",
        "action" : "",
        "onsubmit" : "return false;"
    });
	this.pollForm.appendChild(document.createElement("br"));
	for (var i=0; i<this.optionList.length; i++) {
		var radio = document.createElement('input');
		var tmpid = _this.divid + "_opt_" + i;
		$(radio).attr({
			'id':tmpid,
			'name':this.divid +'_group1',
			'type':'radio',
			'value':i
		});
		var label = document.createElement('label');
		$(label).attr('for', tmpid);
		$(label).text(this.optionList[i]);
		this.pollForm.appendChild(radio);
		this.pollForm.appendChild(label);
		this.pollForm.appendChild(document.createElement("br"));
	}

	var button = document.createElement('button');
	button.onclick = function() {
		_this.submitPoll()
	}
	button.textContent = "Complete";
	$(button).attr({
		"class" : "btn btn-success",
		"name" : "Submit Poll",
	});

	this.resultsDiv.id = this.divid + "_results";


	this.pollForm.appendChild(button);
	this.containerDiv.appendChild(this.pollForm);
	this.containerDiv.appendChild(this.resultsDiv);
	$(this.origElem).replaceWith(this.containerDiv);
}

Poll.prototype.submitPoll = function() {
	var poll_val = $(this.pollForm).find("input:radio[name="+this.divid +"_group1]:checked").val();
    if(poll_val === undefined)
        return;

	var act = '';

	var eventInfo = {'event':'poll', 'act':act, 'div_id':this.divid};

    // log the response to the database
    logBookEvent(eventInfo); // in bookfuncs.js

    // log the fact that the user has answered the poll to local storage
    localStorage.setItem(this.divid, "true");

    // show the results of the poll
    var data = {};
    data.div_id = this.divid;
    data.course = eBookConfig.course;
    jQuery.get(eBookConfig.ajaxURL+'getpollresults', data, this.showPollResults());
}

Poll.prototype.showPollResults = function(data) {

	results = eval(data);
    var total = results[0];
    var opt_list = results[1];
    var count_list = results[2];
    var div_id = results[3];

	this.resultsDiv.html("<b>Results:</b><br><br>");

	var list = $(document.createElement("ol"));
    for(var i=0; i<opt_list.length; i++) {
        var count = count_list[i];
        var percent = (count / total) * 100;
        var text = Math.round(10*percent)/10 + "%";   // round percent to 10ths

        var html = "<li value='"+opt_list[i]+"'><div class='progress'><div class='progress-bar progress-bar-success' style='width:"+percent+"%;'><span class='poll-text'>"+text+"</span></div></div></li>";
        var el = $(html);
        list.append(el);
    }
    this.resultsDiv.append(list);
}

Poll.prototype.checkPollStorage = function() {
	
}


$(document).ready(function() {
	$('[data-component=poll]').each(function(index) {
		pollList[this.id] = new Poll({'orig':this});
	})
});
