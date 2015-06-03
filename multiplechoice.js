  /*
  Created by Isaiah Mayerchak and Kirby Olson on 6/1/15
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

var mcList = {};  //Multiple Choice dictionary

MultipleChoice.prototype = new RunestoneBase();

//<ul> constructor
function MultipleChoice(opts) {
	if (opts) {
		this.init(opts);
	}
}

MultipleChoice.prototype.init = function(opts) {
	RunestoneBase.apply(this, arguments);
	var orig = opts.orig;  //entire <ul> element
	this.origElem = orig;

    this.multipleanswers = false
    this.divid = orig.id;
    if ($(this.origElem).data('multipleanswers') === true) {
        this.multipleanswers = true;
    }

	this.answerList = [];
    this.correctList = [];
	this.feedbackList = [];
	this.question = null;

	this.findAnswers();
	this.findQuestion();
	this.findFeedbacks();
    this.createCorrectList();
    this.createMCForm();
    this.restoreLocalAnswers();

}

MultipleChoice.prototype.findQuestion = function() {     //Takes full text
	var firstanswerid = this.answerList[0].id;
	var delimiter = document.getElementById(firstanswerid).outerHTML;
	var fulltext = $(this.origElem).html();
	var temp = fulltext.split(delimiter);
	this.question = temp[0];

}

MultipleChoice.prototype.findAnswers = function() {  //Creates answer objects and pushes them to answerList
	//ID, Correct bool, Content (text)
    _this = this;
	$('[data-component=answer]').each(function(index) {
		var answer_id = $(this).attr('id');
		var is_correct = false;
		if ( $(this).is("[data-correct]") ) {  //If data-correct attribute exists, answer is correct
			is_correct = true;
		}
		var answer_text = $(this).text();
		var answer_object = {id : answer_id, correct : is_correct, content : answer_text};
		_this.answerList.push(answer_object);
	});
}

MultipleChoice.prototype.findFeedbacks = function() {  //Adds each feedback tuple to dictionary with for_id as key
	//for_id, content (text)
    _this = this
	$('[data-component=feedback]').each(function(index) {
		var for_id = $(this).attr('for');  //selects 'for' attribute
		var feedback_text = $(this).text();
		_this.feedbackList.push(feedback_text);
	});
}


MultipleChoice.prototype.createCorrectList = function() {   //Creates array that holds the ID's of correct answers

    for (var i=0; i < this.answerList.length; i++) {
        if (this.answerList[i].correct) {
            this.correctList.push(this.answerList[i].id);
        }
    }
}



MultipleChoice.prototype.createMCForm = function() {    //Creates form that holds the question/answers
    var formDiv = document.createElement("div");
    $(formDiv).text(this.question);
    $(formDiv).addClass("alert alert-warning");
    formDiv.id = this.divid;
    var newForm = document.createElement("form");
    var feedbackDiv = document.createElement("div");
    var origid = this.origElem.id;

    newForm.id = this.divid + "_form";
    $(newForm).attr({
        "method" : "get",
        "action" : "",
        "onsubmit" : "return false;"
    });
    formDiv.appendChild(newForm);
    feedbackDiv.id = this.divid + "_feedback";

    var input_type = "radio";
    if (this.multipleanswers) {
        input_type = "checkbox";
    }

    for (var i=0; i < this.answerList.length; i++){       //Create form input elements
        var input = document.createElement("input");
        var label = document.createElement("label");
        var br = document.createElement("br");
        input.type = input_type;
        input.name = "group1";
        input.value = String(i);
        var tmpid = String(this.divid) + "_opt_" + String(i);    //what makes id's unique is the index of where it is in answerList
        input.id = tmpid;
        $(label).attr('for', String(tmpid));
        $(label).text(this.answerList[i].content);


        newForm.appendChild(input);
        newForm.appendChild(label);
        newForm.appendChild(br);
    }

    var butt = document.createElement("button");
    var tmpid = this.origElem.id;
    var stringsArray = this.feedbackList;

    butt.textContent = "Check Me";
    butt.id = this.origElem.id + "_bcomp"
    $(butt).attr({
            "class" : "btn btn-success",
            "name" : "do answer",
        })


    if (this.multipleanswers) {          //Second parameter in onclick function varies depending on this
        var expectedArray = [];
        _this = this;
        for (var i=0; i<_this.answerList.length; i++) {
            var tempAnswerId = _this.answerList[i].id;
            var notFound = true
            var j = 0;
            while (notFound && j < _this.correctList.length) {
                if (tempAnswerId == _this.correctList[j]) {
                    expectedArray.push(i);
                    notFound = false;
                }
                j++;
            }
        }

        var expectedString = expectedArray.join();

        butt.onclick = function() {
            checkMCMAStorage(tmpid,expectedString,stringsArray);
        }

    } else {
        var found = false;
        var i=0;
        while (!found) {
            if (this.correctList[0] == this.answerList[i].id){
                found = true;
            }
            i++;
        }
        var correctAnswerIndex = i-1;



        butt.onclick = function() {
            checkMCMFStorage(tmpid,correctAnswerIndex,stringsArray);
        };


    }
    newForm.appendChild(butt);

    var br = document.createElement("br");
    formDiv.appendChild(br);
    formDiv.appendChild(feedbackDiv);


    $(this.origElem).replaceWith(formDiv);

}

MultipleChoice.prototype.restoreLocalAnswers = function() {     //Handles local storage
    if (this.multipleanswers) {
        checkMultipleSelect(this.origElem.id);
    } else {
        checkRadio(this.origElem.id);    
    }
}



$(document).ready(function() {
    $('[data-component=multiplechoice]').each( function(index ){
        mcList[this.id] = new MultipleChoice({'orig':this});
    });

});
