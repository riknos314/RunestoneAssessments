  /*
  Created by Isaiah and Kirby on 6/something/15
  */


//start with basic parent stuff
function RunestoneBase() {

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};

var mcList = {};  //Multiple Choice list

MultipleChoice.prototype = new RunestoneBase();

//<ul> constructor
function MultipleChoice(opts) {
	if (opts) {
		this.init(opts);
	}
}

MultipleChoice.prototype.init = function(opts) {       //Finish later
	RunestoneBase.apply(this, arguments);
	var orig = opts.orig;  //entire <ul> element
	this.origElem = orig;

    this.multipleanswers = false
    this.divid = orig.id;

    if ($(this).data('multipleanswers') === "true") {
        this.multipleanswers = true;
    }

	this.answerList = [];
	this.feedbackDict = {};
	this.question = null;

	this.findAnswers();
	this.findQuestion();
	this.findFeedbacks();
    this.createMCForm();

}

MultipleChoice.prototype.findQuestion = function() {     //Takes full text
	var firstanswerid = this.answerList[0].id;
	var delimiter = document.getElementById(firstanswerid).outerHTML;
	var fulltext = $(this.origElem).html();
	var temp = fulltext.split(delimiter);
    console.log(firstanswerid);
    console.log(delimiter);
    console.log(fulltext);
    console.log(temp);
	this.question = temp[0];

}

MultipleChoice.prototype.findAnswers = function() {  //Creates answer objects and pushes them to answerList
	//ID, Correct bool, Content (text)
    _this = this;
	$('[data-component=answer').each(function(index) {
		var answer_id = $(this).attr('id');
		var is_correct = false;
		if ( $(this).is("[data-correct]") ) {  //If data-correct attribute exists, answer is correct
			is_correct = true;
		}
		var answer_text = $(this).text();
		var answer_object = {id : answer_id, correct : is_correct, content : answer_text};
        console.log(answer_object);
		_this.answerList.push(answer_object);
	});
}

MultipleChoice.prototype.findFeedbacks = function() {  //Adds each feedback tuple to dictionary with for_id as key
	//for_id, content (text)
    _this = this
	$('[data-component=feedback').each(function(index) {
		var for_id = $(this).attr('for');  //selects 'for' attribute
		var feedback_text = $(this).text();
		_this.feedbackDict[for_id] = feedback_text;
	});
}



MultipleChoice.prototype.createMCForm = function() {    //Creates form that holds the question/answers
    var formDiv = document.createElement("div");
    $(formDiv).text(this.question);
    var newForm = document.createElement("form");
    formDiv.appendChild(newForm);
    var input_type = "radio";
    if (this.multipleanswers) {
        input_type = "checkbox";
    }

    for (var i=0; i < this.answerList.length; i++){
        var input = document.createElement("input");
        input.type = input_type;

        newForm.appendChild(input);
    }

    $(this.origElem).replaceWith(formDiv);

}



$(document).ready(function() {
    $('[data-component=multiplechoice]').each( function(index ){
        mcList[this.id] = new MultipleChoice({'orig':this});
    });

});
