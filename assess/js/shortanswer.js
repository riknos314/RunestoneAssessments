/*==========================================
========   Master shortanswer.js   =========
============================================
===     This file contains the JS for    ===
=== the Runestone shortanswer component. ===
============================================
===              Created By              ===
===           Isaiah Mayerchak           ===
===                 and                  ===
===             Kirby Olson              ===
===                6/4/15                ===
==========================================*/

// start with basic parent stuff
function RunestoneBase () {    // Parent function

}

RunestoneBase.prototype.logBookEvent = function (info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function (info) {
    console.log("running " + this.divid);
};

/*=======================================
===         Global functions          ===
=== (used by more than one component) ===
=======================================*/

var feedBack = function (elem, correct, feedbackText) {        // Displays feedback on page--miscellaneous function that can be used by multple objects
    // elem is the Element in which to put the feedback
    if (correct) {
        $(elem).html("You are Correct!");
        $(elem).attr("class", "alert alert-success");
    } else {
        if (feedbackText === null) {
            feedbackText = "";
        }
        $(elem).html("Incorrect.    " + feedbackText);
        $(elem).attr("class", "alert alert-danger");
    }
};

var renderTimedIcon = function (component) {
    // renders the clock icon on timed components.    The component parameter
    // is the element that the icon should be appended to.
    var timeIconDiv = document.createElement("div");
    var timeIcon = document.createElement("img");
    $(timeIcon).attr({
        "src": "../_static/clock.png",
        "style": "width:15px;height:15px"
    });
    timeIconDiv.className = "timeTip";
    timeIconDiv.title = "";
    timeIconDiv.appendChild(timeIcon);
    component.appendChild(timeIconDiv);
};
/*==================================================
== Begin code for the Fill In The Blank component ==
==================================================*/

var ShortAnswerList = {};    // Object containing all instances of ShortAnswer that aren"t a child of a timed assessment.

// ShortAnswer constructor
function ShortAnswer (opts) {
    if (opts) {
        this.init(opts);
    }
}
ShortAnswer.prototype = new RunestoneBase();
/*===================================
===    Setting ShortAnswer variables     ===
===================================*/

ShortAnswer.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <p> element
    this.origElem = orig;
    this.divid = orig.id;
    this.question = null;
    this.correct = null;
    this.feedbackArray = [];// Array of arrays--each inside array contains 2 elements: the regular expression, then text
    this.children = this.origElem.childNodes; // this contains all of the child elements of the entire tag...
    // ... used for ensuring that only things that are part of this instance are being touchedh
    this.correctAnswer = null;                 // Correct answer--is a regular expression
    for (var i = 0; i < this.children.length; i++) {
        if ($(this.children[i]).is("[data-answer]")) {
            this.correctAnswer = $([this.children[i]]).text().replace(/\\\\/g,"\\");
        }
    }
    this.casei = false;                                                             // Case insensitive--boolean
    if ($(this.origElem).data("casei") === true) {
        this.casei = true;
    }
    this.timed = false;    // True if this is a child of a timed assessment component
    if ($(this.origElem).is("[data-timed]")) {
        this.timed = true;
    }
    this.findQuestion();
    this.populateFeedbackArray();
    this.createShortAnswerElement();
    this.checkPreviousShortAnswer();
};

/*====================================
==== Functions parsing variables  ====
====   out of intermediate HTML   ====
====================================*/

ShortAnswer.prototype.findQuestion = function () {         // Gets question text and puts it into this.question
    var firstAnswerId;
    for (var i = 0; i < this.children.length; i++) {
        if ($(this.children[i]).is("[data-answer]")) {
            firstAnswerId = this.children[i].id;
            break;
        }
    }

    var delimiter = document.getElementById(firstAnswerId).outerHTML;
    var fulltext = $(this.origElem).html();
    var temp = fulltext.split(delimiter);
    this.question = temp[0];
};

ShortAnswer.prototype.populateFeedbackArray = function () {        // Populates this.feedbackArray
    var _this = this;
    var AnswerNodeList = [];
    for (var i = 0; i < this.children.length; i++) {
        if ($(this.children[i]).is("[data-feedback=text]")) {
            AnswerNodeList.push(this.children[i]);
        }
    }
    for (var j = 0; j < AnswerNodeList.length; j++) {
        var tempArr = [];
        var tempFor = $(AnswerNodeList[j]).attr("for");
        var tempRegEx = document.getElementById(tempFor).innerHTML.replace(/\\\\/g,"\\");
        tempArr.push(tempRegEx);
        tempArr.push(AnswerNodeList[j].innerHTML);
        _this.feedbackArray.push(tempArr);
    }
};

/*===========================================
====   Functions generating final HTML   ====
===========================================*/

ShortAnswer.prototype.createShortAnswerElement = function () {
    this.renderShortAnswerContainer();
    this.renderShortAnswerInput();
    if (!this.timed) {
        // don"t render buttons if part of a timed assessment
        this.renderShortAnswerButtons();
    }
    this.renderShortAnswerFeedbackDiv();

    // replaces the intermediate HTML for this component with the rendered HTML of this component
    $(this.origElem).replaceWith(this.inputDiv);
};

ShortAnswer.prototype.renderShortAnswerContainer = function () {
    // creates the parent div for the new html
    // puts the question text in the parent div
    this.inputDiv = document.createElement("div");
    $(this.inputDiv).text(this.question);
    $(this.inputDiv).addClass("alert alert-warning");
    this.inputDiv.id = this.divid;
    if (this.timed) {
        renderTimedIcon(this.inputDiv);
    }
};

ShortAnswer.prototype.renderShortAnswerInput = function () {
    // creates the blank and appends it to the parent div
    this.blank = document.createElement("input");
    $(this.blank).attr({
        "type": "text",
        "id": this.divid + "_blank",
        "class": "form-control"
    });
    this.inputDiv.appendChild(document.createElement("br"));
    this.inputDiv.appendChild(this.blank);
    this.inputDiv.appendChild(document.createElement("br"));
};

ShortAnswer.prototype.renderShortAnswerButtons = function () {
    var _this = this;
    this.submitButton = document.createElement("button");    // Check me button
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success",
        "name": "do answer"
    });
    this.submitButton.onclick = function () {
        _this.checkShortAnswerStorage();
    };
    this.compareButton = document.createElement("button");    // Compare me button
    $(this.compareButton).attr({
        "class": "btn btn-default",
        "id": this.origElem.id + "_bcomp",
        "disabled": "",
        "name": "compare"
    });
    this.compareButton.textContent = "Compare Me";
    this.compareButton.onclick = function () {
        _this.compareShortAnswerAnswers();
    };
    this.inputDiv.appendChild(this.submitButton);
    this.inputDiv.appendChild(this.compareButton);
    this.inputDiv.appendChild(document.createElement("div"));
};

ShortAnswer.prototype.renderShortAnswerFeedbackDiv = function () {
    this.feedBackDiv = document.createElement("div");
    this.feedBackDiv.id = this.divid + "_feedback";
    this.inputDiv.appendChild(document.createElement("br"));
    this.inputDiv.appendChild(this.feedBackDiv);
};

/*==============================
=== Local storage & feedback ===
===============================*/

ShortAnswer.prototype.checkPreviousShortAnswer = function () {
    // This function repoplulates ShortAnswer questions with a user"s previous answers,
    // which were stored into local storage
    var len = localStorage.length;
    if (len > 0) {
        var ex = localStorage.getItem(eBookConfig.email + ":" + this.divid);
        if (ex !== null) {
            var arr = ex.split(";");
            $(this.blank).attr("value", arr[0]);
            if (!this.timed) {
                this.compareButton.disabled = false;
            }
        } // end if ex not null
    } // end if len > 0
};

ShortAnswer.prototype.checkShortAnswerStorage = function () {
    // Starts chain of functions which ends with feedBack() displaying feedback to user
    var given = this.blank.value;

    var modifiers = "";
    if (this.casei) {
        modifiers = "i";
    }
    var patt = RegExp(this.correctAnswer, modifiers);
    this.isCorrect = patt.test(given);
    if (given !== "") {
        this.correct = this.isCorrect;
    }
    if (!this.isCorrect) {
        var fbl = this.feedbackArray;
        for (var i = 0; i < fbl.length; i++) {
            patt = RegExp(fbl[i][0]);
            if (patt.test(given)) {
                fbl = fbl[i][1];
                break;
            }
        }
    }
    // store the answer in local storage
    var storage_arr = [];
    storage_arr.push(given);
    storage_arr.push(this.correctAnswer);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));
    this.renderShortAnswerFeedback();
    var answerInfo = "answer:" + given + ":" + (this.isCorrect ? "correct" : "no");
    logBookEvent({"event": "fillb", "act": answerInfo, "div_id": this.divid});
    if (!this.timed) {
        this.compareButton.disabled = false;
    }
};

ShortAnswer.prototype.renderShortAnswerFeedback = function () {
    if (this.isCorrect) {
        $(this.feedBackDiv).html("You are Correct!");
        $(this.feedBackDiv).attr("class", "alert alert-success");
    } else {
        if (this.feedbackArray === null) {
            this.feedbackArray = "";
        }
        $(this.feedBackDiv).html("Incorrect.    " + this.feedbackArray);
        $(this.feedBackDiv).attr("class", "alert alert-danger");
    }
};

/*==================================
=== Functions for compare button ===
==================================*/

ShortAnswer.prototype.compareShortAnswerAnswers = function () {             // Called by compare me button--calls compareShortAnswer
    var data = {};
    data.div_id = this.divid;
    data.course = eBookConfig.course;
    jQuery.get(eBookConfig.ajaxURL + "gettop10Answers", data, this.compareShortAnswer);
};

ShortAnswer.prototype.compareShortAnswer = function (data, status, whatever) {
    var answers = eval(data)[0];
    var misc = eval(data)[1];

    var body = "<table>";
    body += "<tr><th>Answer</th><th>Count</th></tr>";

    for (var row in answers) {
        body += "<tr><td>" + answers[row].answer + "</td><td>" + answers[row].count + " times</td></tr>";
    }
    body += "</table>";
    if (misc["yourpct"] !== "unavailable") {
        body += "<br /><p>You have " + misc["yourpct"] + "% correct for all questions</p>";
    }

    var html = "<div class='modal fade'>" +
        "    <div class='modal-dialog compare-modal'>" +
        "        <div class='modal-content'>" +
        "            <div class='modal-header'>" +
        "                <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
        "                <h4 class='modal-title'>Top Answers</h4>" +
        "            </div>" +
        "            <div class='modal-body'>" +
        body +
        "            </div>" +
        "        </div>" +
        "    </div>" +
        "</div>";
    var el = $(html);
    el.modal();
};

ShortAnswer.prototype.checkCorrectTimedShortAnswer = function () {
    // Returns if the question was correct.    Used for timed assessment grading.
    return this.correct;
};

$(document).ready(function () {
    $("[data-component=shortanswer]").each(function (index) {    // FITB
        ShortAnswerList[this.id] = new ShortAnswer({"orig": this});
    });
});
