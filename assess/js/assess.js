 /*
  Created by Isaiah Mayerchak and Kirby Olson on 6/4/15
  */


//start with basic parent stuff

function RunestoneBase() {  //Parent function

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};





//Fill-in-the-blank part

var FITBList = {};  //Fill-in-the-blank dictionary

FITB.prototype = new RunestoneBase();

//<p> FITB constructor
function FITB(opts) {
    if (opts) {
        this.init(opts);
    }
}

FITB.prototype.init = function(opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;  //entire <p> element
    this.origElem = orig;
    this.divid = orig.id;
    this.question = null;
    this.feedbackArray = [];//Array of arrays--each inside array contains 2 elements: the regular expression, then text
    this.children = this.origElem.childNodes; //this contains all of the child elements of the entire tag...
        //... used for ensuring that only things that are part of this instance are being touchedh
    this.correctAnswer = null;         //Correct answer--is a regular expression
    for (var i=0; i<this.children.length; i++) {
        if ($(this.children[i]).is("[data-answer]")) {
            this.correctAnswer = $([this.children[i]]).text();
        }
    }
    this.casei = false;                               //Case insensitive--boolean
    if ($(this.origElem).data('casei') === true) {
        this.casei = true;
    }


    this.findQuestion();
    this.populateFeedbackArray();
    this.createFITBElement();
    this.checkPreviousFIB();
}


FITB.prototype.findQuestion = function() {     //Gets question text and puts it into this.question
    for (var i=0; i< this.children.length; i++){
        if ($(this.children[i]).is("[data-answer]")) {
            var firstAnswerId = this.children[i].id;
            break;
        }
    }

    var delimiter = document.getElementById(firstAnswerId).outerHTML;
    var fulltext = $(this.origElem).html();
    var temp = fulltext.split(delimiter);
    this.question = temp[0];
}


FITB.prototype.populateFeedbackArray = function() {    //Populates this.feedbackArray
        var _this = this;
        var AnswerNodeList = [];
        for (var i=0; i< this.children.length; i++){
            if ($(this.children[i]).is("[data-feedback=text]")){
                AnswerNodeList.push(this.children[i]);
            }
        }
    for (var i=0; i<AnswerNodeList.length;i++) {
        var tempArr = [];
        var tempFor = $(AnswerNodeList[i]).attr('for');
        var tempRegEx = document.getElementById(tempFor).innerHTML;
        tempArr.push(tempRegEx);
        tempArr.push(AnswerNodeList[i].innerHTML);
        _this.feedbackArray.push(tempArr);

    };
}

FITB.prototype.createFITBElement = function() {      //Creates input element that is appended to DOM
    var _this = this;
    var inputDiv = document.createElement('div');
    $(inputDiv).text(this.question);
    $(inputDiv).addClass("alert alert-warning");
    inputDiv.id = this.divid;
    var newInput = document.createElement('input');
    var feedbackDiv = document.createElement('div');

    $(newInput).attr({
        'type' : 'text',
        'id' : this.divid + 'blank',
        'class' : 'form-control'
        });

    feedbackDiv.id = this.divid + '_feedback';
    var butt = document.createElement('button');         //Check me button
    butt.textContent = "Check Me";
    $(butt).attr({
            "class" : "btn btn-success",
            "name" : "do answer",
        });


    butt.onclick = function() {
        _this.checkFIBStorage();
    }


    var compButt = document.createElement("button");       //Compare me button
    $(compButt).attr({
        "class":"btn btn-default",
        "id":this.origElem.id+"_bcomp",
        "disabled":"",
        "name":"compare",
    });
    compButt.textContent = "Compare Me";
    compButt.onclick = function() {
        _this.compareFITBAnswers();
    }
    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(newInput);
    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(butt);
    inputDiv.appendChild(compButt);
    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(document.createElement('br'));

    inputDiv.appendChild(feedbackDiv);

    $(this.origElem).replaceWith(inputDiv);


}

FITB.prototype.checkPreviousFIB = function() {
    // This function repoplulates FIB questions with a user's previous answers,
    // which were stored into local storage

    var len = localStorage.length;
    if (len > 0) {
        var ex = localStorage.getItem(eBookConfig.email + ":" + this.divid);
        if (ex !== null) {
           var arr = ex.split(";");
           var str = this.divid + "blank";
           $("#" + str).attr("value", arr[0]);
           document.getElementById(this.divid + '_bcomp').disabled = false;
        } // end if ex not null
    } // end if len > 0
};

FITB.prototype.checkFIBStorage = function() {                //Starts chain of functions which ends with feedBack() displaying feedback to user
    var given = document.getElementById(this.divid + "blank").value;
    // update number of trials??
    // log this to the db
    modifiers = '';
    if (this.casei) {
        modifiers = 'i'
    }
    var patt = RegExp(this.correctAnswer, modifiers);
    var isCorrect = patt.test(given);
    if (!isCorrect) {
        fbl = this.feedbackArray;
        for (var i = 0; i < fbl.length; i++) {
            patt = RegExp(fbl[i][0]);
            if (patt.test(given)) {
                fbl = fbl[i][1];
                break;
            }
        }
    }
    // store the answer in local storage
    var storage_arr = new Array();
    storage_arr.push(given);
    storage_arr.push(this.correctAnswer);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));

    feedBack('#' + this.divid + '_feedback', isCorrect, this.feedbackArray);
    var answerInfo = 'answer:' + given + ":" + (isCorrect ? 'correct' : 'no');
    logBookEvent({'event': 'fillb', 'act': answerInfo, 'div_id': this.divid});
    document.getElementById(this.divid + '_bcomp').disabled = false;
};


FITB.prototype.compareFITBAnswers = function() {       //Called by compare me button--calls compareFITB
    data = {};
    data.div_id = this.divid;
    data.course = eBookConfig.course;
    jQuery.get(eBookConfig.ajaxURL + 'gettop10Answers', data, this.compareFITB);
}

FITB.prototype.compareFITB = function(data, status, whatever) {
    var answers = eval(data)[0];
    var misc = eval(data)[1];

    var body = '<table>';
    body += '<tr><th>Answer</th><th>Count</th></tr>';

    for (var row in answers) {
        body += '<tr><td>' + answers[row].answer + '</td><td>' + answers[row].count + ' times</td></tr>';
    }
    body += '</table>';
    if (misc['yourpct'] !== 'unavailable') {
        body += '<br /><p>You have ' + misc['yourpct'] + '% correct for all questions</p>';
    }

    var html = '<div class="modal fade">' +
        '  <div class="modal-dialog compare-modal">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '        <h4 class="modal-title">Top Answers</h4>' +
        '      </div>' +
        '      <div class="modal-body">' +
        body +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    el = $(html);
    el.modal();
}



//Multiple Choice part

function RunestoneBase() {

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};

var mcList = {};  //Multiple Choice dictionary

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

    this.children = this.origElem.childNodes;

    this.random = false;
    if ($(this.origElem).is("[data-random]")){
        this.random = true;
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

MultipleChoice.prototype.findAnswers = function() {
    //Creates answer objects and pushes them to answerList
    //format: ID, Correct bool, Content (text)

    var _this = this;
    var ChildAnswerList = [];
    for (var i=0; i<_this.children.length; i++){
        if ($(_this.children[i]).is("[data-component=answer]")){
            ChildAnswerList.push(_this.children[i]);
        }
    }
    for (var i=0; i<ChildAnswerList.length; i++) {

        var answer_id = $(ChildAnswerList[i]).attr('id');

        var is_correct = false;
        if ( $(ChildAnswerList[i]).is("[data-correct]") ) {  //If data-correct attribute exists, answer is correct
            is_correct = true;
        }
        var answer_text = $(ChildAnswerList[i]).text();
        var answer_object = {id : answer_id, correct : is_correct, content : answer_text};
        _this.answerList.push(answer_object);
    };
}

MultipleChoice.prototype.findFeedbacks = function() {  //Adds each feedback tuple to dictionary with for_id as key
    //for_id, content (text)

    var _this = this
    var ChildFeedbackList =[];
    for (var i=0; i< this.children.length; i++){
        if ($(_this.children[i]).is("[data-component=feedback]")){
            ChildFeedbackList.push(_this.children[i]);
        }
    }
    for (var i=0; i<ChildFeedbackList.length; i++) {
        var for_id = $(ChildFeedbackList[i]).attr('for');  //selects 'for' attribute
        var feedback_text = $(ChildFeedbackList[i]).text();
        _this.feedbackList.push(feedback_text);
    };
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
    formDiv.appendChild(document.createElement('br'));
    formDiv.appendChild(document.createElement('br'));


    formDiv.appendChild(newForm);
    feedbackDiv.id = this.divid + "_feedback";

    var input_type = "radio";
    if (this.multipleanswers) {
        input_type = "checkbox";
    }
    this.indexArray = [];  //this is used to keep indices correct when using the ramdom function
    for (var i=0; i<this.answerList.length; i++){ //populate the array with enough indices for the number of answers
        this.indexArray.push(i);
    }
    if (this.random){ //if nessecarry, randomizes the indices, randomizing the order the answers are rendered
        this.randomizeAnswers();
    }

    for (var i=0; i < this.answerList.length; i++){       //Create form input elements
        var j = this.indexArray[i];
        var input = document.createElement("input");
        var label = document.createElement("label");
        var br = document.createElement("br");
        input.type = input_type;
        input.name = "group1";
        input.value = String(j);
        var tmpid = String(this.divid) + "_opt_" + String(j);    //what makes id's unique is the index of where it is in answerList
        input.id = tmpid;
        $(label).attr('for', String(tmpid));
        $(label).text(this.answerList[j].content);


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

    formDiv.appendChild(document.createElement('br'));

    formDiv.appendChild(feedbackDiv);


    $(this.origElem).replaceWith(formDiv);

}

MultipleChoice.prototype.randomizeAnswers = function() {
    var currentIndex = this.indexArray.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      var randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      var temporaryValue = this.indexArray[currentIndex];
      this.indexArray[currentIndex] = this.indexArray[randomIndex];
      this.indexArray[randomIndex] = temporaryValue;

      var temporaryFeedback = this.feedbackList[currentIndex];
      this.feedbackList[currentIndex] = this.feedbackList[randomIndex];
      this.feedbackList[randomIndex] = temporaryFeedback;
    }

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
    console.log(this.feedbackList);

    // loop through the checkboxes
    var _this = this
    for (var i = 0; i < buttonObjs.length; i++) {
        if (buttonObjs[i].checked) { // if checked box
            given = buttonObjs[i].value; // get value of this button
            givenArray.push(given)    // add it to the givenArray
            var intGiven = parseInt(given) + 1;
            feedback += intGiven + ": " + _this.feedbackList[i] + "<br />"; // add the feedback
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



var feedBack = function (divid, correct, feedbackText) {    //Displays feedback on page--miscellaneous function that can be used by multple objects
    if (correct) {
        $(divid).html('You are Correct!');
        //$(divid).css('background-color', '#C8F4AD');
        $(divid).attr('class','alert alert-success');
    } else {
        if (feedbackText == null) {
            feedbackText = '';
        }
        $(divid).html("Incorrect.  " + feedbackText);
        //$(divid).css('background-color', '#F4F4AD');
        $(divid).attr('class','alert alert-danger');
    }
};

$(document).ready(function() {
    //must put timed assessment before the others so that any fillintheblank or
        //multiplechoice in the timed component are not rendered outside of the timed assessment
    $('[data-component=fillintheblank]').each(function(index){  //FITB
        FITBList[this.id] = new FITB({'orig':this});
    });

    $('[data-component=multiplechoice]').each( function(index ){  //MC
        mcList[this.id] = new MultipleChoice({'orig':this});
    });

});
