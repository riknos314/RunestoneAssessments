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
	this.divid = orig.id;
	this.answerList = [];
	this.feedbackDict = {};
	this.question = null;
	this.findAnswers();
	this.findQuestions();
	this.findFeedbacks();

}

MultipleChoice.prototype.findQuestion = function() {     //Takes full text
	var firstanswerid = this.answerList[0].id;
	var delimiter = $(firstanswerid).outerHTML;
	var fulltext = $(this).html();
	var temp = fulltext.split(delimiter);
	this.question = temp[0];

}

MultipleChoice.prototype.findAnswers = function() {  //Creates answer objects and pushes them to answerList
	//ID, Correct bool, Content (text)

	$('[data-component=answer').each(function(index)) {
		var answer_id = $(this).id();
		var is_correct = false;
		if ( $(this).is("[data-correct]") ) {  //If data-correct attribute exists, answer is correct
			is_correct = true;
		}
		var answer_text = $(this).text();
		var answer_object = {id : answer_id, correct : is_correct, content : answer_text};
		this.answerList.push(answer_object);
	}
}

MultipleChoice.prototype.findFeedbacks = function() {  //Adds each feedback tuple to dictionary with for_id as key
	//for_id, content (text)

	$('[data-component=feedback').each(function(index)) {
		var for_id = $(this).attr('for');  //selects 'for' attribute
		var feedback_text = $(this).text();
		this.feedbackDict[for_id] = feedback_text;
	}
}



MultipleChoice.prototype.createMCForm = function() {    //Creates form that holds the question/answers

}





