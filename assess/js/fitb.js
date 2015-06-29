var $ = require("jquery");

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
            this.correctAnswer = $([this.children[i]]).text();
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
    this.createFITBElement();
    this.checkPreviousFIB();
};

/*====================================
==== Functions parsing variables  ====
====   out of intermediate HTML   ====
====================================*/

FITB.prototype.findQuestion = function () {         // Gets question text and puts it into this.question
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

FITB.prototype.populateFeedbackArray = function () {        // Populates this.feedbackArray
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
        var tempRegEx = document.getElementById(tempFor).innerHTML;
        tempArr.push(tempRegEx);
        tempArr.push(AnswerNodeList[j].innerHTML);
        _this.feedbackArray.push(tempArr);
    }
};

/*===========================================
====   Functions generating final HTML   ====
===========================================*/

FITB.prototype.createFITBElement = function () {
    this.renderFITBContainer();
    this.renderFITBInput();
    if (!this.timed) {
        // don"t render buttons if part of a timed assessment
        this.renderFITBButtons();
    }
    this.renderFITBFeedbackDiv();

    // replaces the intermediate HTML for this component with the rendered HTML of this component
    $(this.origElem).replaceWith(this.inputDiv);
};

FITB.prototype.renderFITBContainer = function () {
    // creates the parent div for the new html
    // puts the question text in the parent div
    this.inputDiv = document.createElement("div");
    $(this.inputDiv).text(this.question);
    $(this.inputDiv).addClass("alert alert-warning");
    this.inputDiv.id = this.divid;
    if (this.timed) {
        this.renderTimedIcon();
    }
};

FITB.prototype.renderFITBInput = function () {
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

FITB.prototype.checkFITBStorage = function () {
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
    this.renderFITBFeedback();
    var answerInfo = "answer:" + given + ":" + (this.isCorrect ? "correct" : "no");
    //logBookEvent({"event": "fillb", "act": answerInfo, "div_id": this.divid});
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

FITB.prototype.renderTimedIcon = function () {
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
    this.inputDiv.appendChild(timeIconDiv);
};

module.exports = FITB;  //export the constructor method
