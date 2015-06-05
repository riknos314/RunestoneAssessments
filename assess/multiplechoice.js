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

    butt.textContent = "Check Me";
    $(butt).attr({
            "class" : "btn btn-success",
            "name" : "do answer",
        });

    var _this = this;
    if (this.multipleanswers) {          //Second parameter in onclick function varies depending on this
        var expectedArray = [];

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
        this.expectedString = expectedArray.join();

        butt.onclick = function() {
            _this.checkMCMAStorage();
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
        this.correctAnswerIndex = i-1;

        butt.onclick = function() {
            _this.checkMCMFStorage();
        };


    }

    var compButt = document.createElement("button");
    $(compButt).attr({
        "class":"btn btn-default",
        "id":this.origElem.id+"_bcomp",
        "disabled":"",
        "name":"compare",
    });
    compButt.textContent = "Compare Me";
    compButt.onclick = function() {
        compareAnswers(this.divid);
    }

    newForm.appendChild(butt);
    newForm.appendChild(compButt);

    var br = document.createElement("br");
    formDiv.appendChild(br);
    formDiv.appendChild(feedbackDiv);


    $(this.origElem).replaceWith(formDiv);

}

MultipleChoice.prototype.restoreLocalAnswers = function() {     //Handles local storage
    if (this.multipleanswers) {
        this.checkMultipleSelect();
    } else {
        this.checkRadio();
    }
}
MultipleChoice.prototype.checkMultipleSelect = function () {
    // This function repopulates MCMA questions with a user's previous answers,
    // which were stored into local storage.
    var _this = this;
    var len = localStorage.length;
    if (len > 0) {

    	var ex = localStorage.getItem(eBookConfig.email + ":" + _this.divid);
    	if (ex !== null) {
            var arr = ex.split(";");
            var answers = arr[0].split(",");
            for (var a = 0; a < answers.length; a++) {
                var str = "#"+_this.divid + "_opt_" + answers[a];
                $(str).attr("checked", "true");
                document.getElementById(_this.divid + '_bcomp').disabled = false;
            } // end for
        } // end if
    } // end if len > 0
};

MultipleChoice.prototype.checkRadio = function () {
    // This function repopulates a MCMF question with a user's previous answer,
    // which was previously stored into local storage
    _this = this
    var len = localStorage.length;

    //retrieving data from local storage
    if (len > 0) {
      var ex = localStorage.getItem(eBookConfig.email + ":" + _this.divid);
      if (ex !== null)
      {
      	var arr = ex.split(";");
      	var str = "#"+_this.divid + "_opt_" + arr[0];
      	$(str).attr("checked", "true");
      	document.getElementById(_this.divid + '_bcomp').disabled = false;
      } // end if not null
    } // end if (len > 0)
};

MultipleChoice.prototype.checkMCMAStorage = function () {
    var given;
    var feedback = "";
    var correctArray = this.expectedString.split(",");
    correctArray.sort();
    var givenArray = [];
    var correctCount = 0;
    var correctIndex = 0;
    var givenIndex = 0;
    var givenlog = '';
    var buttonObjs = document.forms[this.divid + "_form"].elements.group1;

    // loop through the checkboxes
    var _this = this
    for (var i = 0; i < buttonObjs.length; i++) {
        if (buttonObjs[i].checked) { // if checked box
            given = buttonObjs[i].value; // get value of this button
            givenArray.push(given)    // add it to the givenArray
            feedback += given + ": " + _this.feedbackList[i] + "<br />"; // add the feedback
            givenlog += given + ",";
        }
    }
    // sort the given array
    givenArray.sort();

    while (correctIndex < correctArray.length &&
        givenIndex < givenArray.length) {
        if (givenArray[givenIndex] < correctArray[correctIndex]) {
            givenIndex++;
        }
        else if (givenArray[givenIndex] == correctArray[correctIndex]) {
            correctCount++;
            givenIndex++;
            correctIndex++;
        }
        else {
            correctIndex++;
        }

    } // end while

    // save the data into local storage
    var storage_arr = new Array();
    storage_arr.push(givenArray);
    storage_arr.push(this.expectedArray);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));

    // log the answer
    var answerInfo = 'answer:' + givenlog.substring(0, givenlog.length - 1) + ':' +
        (correctCount == correctArray.length ? 'correct' : 'no');
    logBookEvent({'event': 'mChoice', 'act': answerInfo, 'div_id': _this.divid});

    // give the user feedback
    this.feedBackMCMA(correctCount,
        correctArray.length, givenArray.length, feedback);

    document.getElementById(this.divid + '_bcomp').disabled = false;
};

MultipleChoice.prototype.feedBackMCMA = function (numCorrect, numNeeded, numGiven, feedbackText) {
    tmpdivid = "#"+this.divid + "_feedback";
    var answerStr = "answers";
    if (numGiven == 1) answerStr = "answer";

    if (numCorrect == numNeeded && numNeeded == numGiven) {
        $(tmpdivid).html('Correct!  <br />' + feedbackText);
        $(tmpdivid).attr('class', 'alert alert-success');
    } else {
        $(tmpdivid).html("Incorrect.  " + "You gave " + numGiven +
            " " + answerStr + " and got " + numCorrect + " correct of " +
            numNeeded + " needed.<br /> " + feedbackText);
        $(tmpdivid).attr('class', 'alert alert-danger');
    }
};

MultipleChoice.prototype.checkMCMFStorage = function () {
    var given;
    var feedback = null;
    var buttonObjs = document.forms[this.divid + "_form"].elements.group1;
    for (var i = buttonObjs.length - 1; i >= 0; i--) {
        if (buttonObjs[i].checked) {
            given = buttonObjs[i].value;
            feedback = this.feedbackList[i];
        }
    }

    //Saving data in local storage
    var storage_arr = new Array();
    storage_arr.push(given);
    storage_arr.push(this.correctAnswerIndex);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));

    // log the answer
    var answerInfo = 'answer:' + given + ":" + (given == this.correctAnswerIndex ? 'correct' : 'no');
    logBookEvent({'event': 'mChoice', 'act': answerInfo, 'div_id': this.divid});

    // give the user feedback
    this.feedBackMCMF(given == this.correctAnswerIndex, feedback);
    document.getElementById(this.divid + '_bcomp').disabled = false;
};

MultipleChoice.prototype.feedBackMCMF = function (correct, feedbackText) {
    var tmpdivid = "#"+this.divid+"_feedback";
    if (correct) {
        $(tmpdivid).html('Correct!  ' + feedbackText);
        $(tmpdivid).attr('class','alert alert-success');
    } else {
        if (feedbackText == null) {
            feedbackText = '';
        }
        $(tmpdivid).html("Incorrect.  " + feedbackText);
        $(tmpdivid).attr('class','alert alert-danger');
    }
};

$(document).ready(function() {
    $('[data-component=multiplechoice]').each( function(index ){
        mcList[this.id] = new MultipleChoice({'orig':this});
    });

});
