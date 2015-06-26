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

var FITBList = {};    // Object containing all instances of FITB that aren"t a child of a timed assessment.

// FITB constructor
function FITB (opts) {
    if (opts) {
        this.init(opts);
    }
}
/*===================================
===    Setting FITB variables     ===
===================================*/

FITB.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <p> element
    this.origElem = orig;
    this.divid = orig.id;
    this.questionArray = [];
    this.correct = [];
    this.feedbackArray = [];// Array of arrays--each inside array contains 2 elements: the regular expression, then text
    this.children = []; // this contains all of the child elements of the entire tag...
    // ... used for ensuring that only things that are part of this instance are being touchedh
    this.correctAnswerArray = [];                 // Correct answer--is a regular expression

    this.adoptChildren();
    this.populateCorrectAnswerArray();
    this.populateQuestionArray();

    this.casei = false;                                                             // Case insensitive--boolean
    if ($(this.origElem).data("casei") === true) {
        this.casei = true;
    }
    this.timed = false;    // True if this is a child of a timed assessment component
    if ($(this.origElem).is("[data-timed]")) {
        this.timed = true;
    }
    this.populateFeedbackArray();
    this.createFITBElement();
    this.checkPreviousFIB();
};

/*====================================
==== Functions parsing variables  ====
====   out of intermediate HTML   ====
====================================*/
FITB.prototype.adoptChildren = function () {
    var children = this.origElem.childNodes;
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-blank]")) {
            this.children.push(this.origElem.childNodes[i]);
        }
    }
};

FITB.prototype.populateCorrectAnswerArray = function () {
    for (var i = 0; i < this.children.length; i++) {
        for (var j=0; j < this.children[i].childNodes.length; j++) {
            if ($(this.children[i].childNodes[j]).is("[data-answer]")) {
                this.correctAnswerArray.push($([this.children[i].childNodes[j]]).text());
            }
        }
    }
};
FITB.prototype.populateQuestionArray = function () {         // Gets question text and puts it into this.question
    for (var i = 0; i < this.children.length; i++) {
        var firstAnswerId = null;
        for (var j = 0; j < this.children[i].childNodes.length; j++) {
            if ($(this.children[i].childNodes[j]).is("[data-answer]")) {
                firstAnswerId = this.children[i].childNodes[j].id;

                var delimiter = document.getElementById(firstAnswerId).outerHTML;
                var fulltext = $(this.children[i]).html();
                var temp = fulltext.split(delimiter);
                this.questionArray.push(temp[0]);
                break;
            }
        }
    }
};

FITB.prototype.populateFeedbackArray = function () {        // Populates this.feedbackArray
    for (var i = 0; i < this.children.length; i++) {
        var AnswerNodeList = [];
        var tmpContainArr = [];
        for (var j = 0; j < this.children[i].childNodes.length; j++) {
            if ($(this.children[i].childNodes[j]).is("[data-feedback=text]")) {

                AnswerNodeList.push(this.children[i].childNodes[j]);
            }
        }

        for (var j = 0; j < AnswerNodeList.length; j++) {
            var tempArr = [];
            var tempFor = $(AnswerNodeList[j]).attr("for");
            var tempRegEx = document.getElementById(tempFor).innerHTML;
            tempArr.push(tempRegEx);
            tempArr.push(AnswerNodeList[j].innerHTML);
            tmpContainArr.push(tempArr);
        }
        this.feedbackArray.push(tmpContainArr);

    }
    console.log(this.feedbackArray);
};

/*===========================================
====   Functions generating final HTML   ====
===========================================*/

FITB.prototype.createFITBElement = function () {
    this.renderFITBInput();
    if (!this.timed) {
        // don"t render buttons if part of a timed assessment
        this.renderFITBButtons();
    }
    this.renderFITBFeedbackDiv();

    // replaces the intermediate HTML for this component with the rendered HTML of this component
    $(this.origElem).replaceWith(this.inputDiv);
};


FITB.prototype.renderFITBInput = function () {
    // creates the blank and appends it to the parent div
    this.inputDiv = document.createElement("div");
    $(this.inputDiv).addClass("alert alert-warning");
    this.inputDiv.id = this.divid;
    if (this.timed) {
        renderTimedIcon(this.inputDiv);
    }

    this.blankArray = [];
    for (var i = 0; i < this.children.length; i++) {
        var question = document.createElement('span');
        question.innerHTML = this.questionArray[i];
        this.inputDiv.appendChild(question);

        var blank = document.createElement("input");
        $(blank).attr({
            "type": "text",
            "id": this.divid + "_blank" + i,
        });
        this.inputDiv.appendChild(blank);
        this.blankArray.push(blank);
    }

};

FITB.prototype.renderFITBButtons = function () {
    var _this = this;
    this.submitButton = document.createElement("button");    // Check me button
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success",
        "name": "do answer"
    });
    this.submitButton.onclick = function () {
        _this.checkFITBStorage();
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
        _this.compareFITBAnswers();
    };
    this.inputDiv.appendChild(this.submitButton);
    this.inputDiv.appendChild(this.compareButton);
    this.inputDiv.appendChild(document.createElement("div"));
};

FITB.prototype.renderFITBFeedbackDiv = function () {
    this.feedBackDiv = document.createElement("div");
    this.feedBackDiv.id = this.divid + "_feedback";
    this.inputDiv.appendChild(document.createElement("br"));
    this.inputDiv.appendChild(this.feedBackDiv);
};

/*==============================
=== Local storage & feedback ===
===============================*/

FITB.prototype.checkPreviousFIB = function () {
    // This function repoplulates FIB questions with a user"s previous answers,
    // which were stored into local storage
    var len = localStorage.length;
    if (len > 0) {
        var ex = localStorage.getItem(eBookConfig.email + ":" + this.divid + "-given");
        if (ex !== null) {
            var arr = ex.split(";");
            for (var i = 0; i < this.blankArray.length; i++) {
                $(this.blankArray[i]).attr("value", arr[i]);
                if (!this.timed) {
                    this.compareButton.disabled = false;
                }
            }

        } // end if ex not null
    } // end if len > 0
};

FITB.prototype.checkFITBStorage = function () {
    this.isCorrect = true;  // Initialize to true
    // Starts chain of functions which ends with feedBack() displaying feedback to user
    var given_arr = [];
    for (var i = 0; i < this.children.length; i++) {
        var given = this.blankArray[i].value;

        var modifiers = "";
        if (this.casei) {
            modifiers = "i";
        }
        var patt = RegExp(this.correctAnswerArray[i], modifiers);
        if (this.isCorrect) {
            this.isCorrect = patt.test(given);
        }
        if (given !== "") {
            this.correct = this.isCorrect;
        }
        if (!this.isCorrect) {
            var fbl = this.feedbackArray[i];
            console.log(fbl);
            for (var j = 0; j < fbl.length; j++) {
                patt = RegExp(fbl[j][0]);
                if (patt.test(given)) {
                    fbl = fbl[j][1];
                    break;
                }
            }
        }
        // store the answer in local storage
        given_arr.push(given);
    }
    localStorage.setItem(eBookConfig.email + ":" + this.divid + "-given", given_arr.join(";"));
    this.renderFITBFeedback();
    var answerInfo = "answer:" + given + ":" + (this.isCorrect ? "correct" : "no");
    logBookEvent({"event": "fillb", "act": answerInfo, "div_id": this.divid});
    if (!this.timed) {
        this.compareButton.disabled = false;
    }
};

FITB.prototype.renderFITBFeedback = function () {
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

FITB.prototype.compareFITBAnswers = function () {             // Called by compare me button--calls compareFITB
    var data = {};
    data.div_id = this.divid;
    data.course = eBookConfig.course;
    jQuery.get(eBookConfig.ajaxURL + "gettop10Answers", data, this.compareFITB);
};

FITB.prototype.compareFITB = function (data, status, whatever) {
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

FITB.prototype.checkCorrectTimedFITB = function () {
    // Returns if the question was correct.    Used for timed assessment grading.
    return this.correct;
};

$(document).ready(function () {


    $("[data-component=fillintheblank]").each(function (index) {    // FITB
        FITBList[this.id] = new FITB({"orig": this});
    });


});
