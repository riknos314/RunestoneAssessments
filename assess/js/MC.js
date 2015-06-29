/*=======================================
=========================================
==== Begin Multiple Choice Component ====
=========================================
=======================================*/
var $ = require("jquery");
var jQuery = $;


// constructor
function MultipleChoice (opts) {
    if (opts) {
        this.init(opts);
    }
}

/*===================================
===     Setting MC variables      ===
===================================*/

MultipleChoice.prototype.init = function (opts) {
    //RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <ul> element
    this.origElem = orig;

    this.multipleanswers = false;
    this.divid = orig.id;
    if ($(this.origElem).data("multipleanswers") === true) {
        this.multipleanswers = true;
    }

    this.children = this.origElem.childNodes;

    this.random = false;
    if ($(this.origElem).is("[data-random]")) {
        this.random = true;
    }
    this.timed = false;
    if ($(this.origElem).is("[data-timed]")) {
        this.timed = true;
    }

    this.correct = null; // used to inform timed instances if this question was answered correctly

    this.answerList = [];
    this.correctList = [];
    this.correctIndexList = [];
    this.feedbackList = [];
    this.question = null;

    this.findAnswers();
    this.findQuestion();
    this.findFeedbacks();
    this.createCorrectList();
    this.createMCForm();
    this.restoreLocalAnswers();
};

/*====================================
==== Functions parsing variables  ====
====  out of intermediate HTML    ====
====================================*/

MultipleChoice.prototype.findQuestion = function () {         // Takes full text
    var firstanswerid = this.answerList[0].id;
    var delimiter = document.getElementById(firstanswerid).outerHTML;
    var fulltext = $(this.origElem).html();
    var temp = fulltext.split(delimiter);
    this.question = temp[0];
};

MultipleChoice.prototype.findAnswers = function () {
    // Creates answer objects and pushes them to answerList
    // format: ID, Correct bool, Content (text)

    var _this = this;
    var ChildAnswerList = [];
    for (var i = 0; i < _this.children.length; i++) {
        if ($(_this.children[i]).is("[data-component=answer]")) {
            ChildAnswerList.push(_this.children[i]);
        }
    }
    for (var j = 0; j < ChildAnswerList.length; j++) {
        var answer_id = $(ChildAnswerList[j]).attr("id");
        var is_correct = false;
        if ($(ChildAnswerList[j]).is("[data-correct]")) {    // If data-correct attribute exists, answer is correct
            is_correct = true;
        }
        var answer_text = $(ChildAnswerList[j]).text();
        var answer_object = {id: answer_id, correct: is_correct, content: answer_text};
        _this.answerList.push(answer_object);
    }
};

MultipleChoice.prototype.findFeedbacks = function () {
    var _this = this;
    for (var i = 0; i < this.children.length; i++) {
        if ($(_this.children[i]).is("[data-component=feedback]")) {
            _this.feedbackList.push(_this.children[i].innerHTML);
        }
    }
};

MultipleChoice.prototype.createCorrectList = function () {
    // Creates array that holds the ID"s of correct answers
    // Also populates an array that holds the indeces of correct answers
    for (var i = 0; i < this.answerList.length; i++) {
        if (this.answerList[i].correct) {
            this.correctList.push(this.answerList[i].id);
            this.correctIndexList.push(i);
        }
    }
};

/*===========================================
====   Functions generating final HTML   ====
===========================================*/

MultipleChoice.prototype.createMCForm = function () {
    this.renderMCContainer();
    if (this.timed) {
        this.renderTimedIcon();
    }
    this.renderMCForm();    // renders the form with options and buttons
    this.renderMCfeedbackDiv();

    // replaces intermediate HTML with rendered HTML
    $(this.origElem).replaceWith(this.MCContainer);
};

MultipleChoice.prototype.renderMCContainer = function () {
    this.MCContainer = document.createElement("div");
    $(this.MCContainer).text(this.question);
    $(this.MCContainer).addClass("alert alert-warning");
    this.MCContainer.id = this.divid;
};

MultipleChoice.prototype.renderMCForm = function () {
    this.optsForm = document.createElement("form");
    this.optsForm.id = this.divid + "_form";
    $(this.optsForm).attr({
        "method": "get",
        "action": "",
        "onsubmit": "return false;"
    });

    // generate form options
    this.renderMCFormOpts();

    // If timed, don"t render buttons
    if (!this.timed) {
        this.renderMCFormButtons();
    }

    // Append the form to the container
    this.MCContainer.appendChild(this.optsForm);
};

MultipleChoice.prototype.renderMCFormOpts = function () {
    this.optionArray = []; // array with an object for each option containing the input and label for that option
    var input_type = "radio";
    if (this.multipleanswers) {
        input_type = "checkbox";
    }
    // this.indexArray is used to index through the answers
    // it is just 0-n normally, but the order is shuffled if the random option is present
    this.indexArray = [];
    for (var i = 0; i < this.answerList.length; i++) {
        this.indexArray.push(i);
    }

    if (this.random) {
        this.randomizeAnswers();
    }

    for (var j = 0; j < this.answerList.length; j++) {
        var k = this.indexArray[j];
        var optid = this.divid + "_opt_" + k;

        // Create the input
        var input = document.createElement("input");
        input.type = input_type;
        input.name = "group1";
        input.value = String(k);
        input.id = optid;

        // Create the label for the input
        var label = document.createElement("label");
        $(label).attr("for", optid);
        $(label).text(this.answerList[k].content);

        // create the object to store in optionArray
        var optObj = {
            input: input,
            label: label
        };
        this.optionArray.push(optObj);

        // add the option to the form
        this.optsForm.appendChild(input);
        this.optsForm.appendChild(label);
        this.optsForm.appendChild(document.createElement("br"));

        // if timed, add a feedback Div for the option
        if (this.timed) {
            var feedBackEach = document.createElement("div");
            feedBackEach.id = this.divid + "_eachFeedback_" + k;
            this.optsForm.appendChild(feedBackEach);
        }
    }
};

MultipleChoice.prototype.renderMCFormButtons = function () {
    var _this = this;    // used for defining onclick functions because of the different scope

    // Create submit button
    this.submitButton = document.createElement("button");
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success",
        "name": "do answer"
    });
    if (this.multipleanswers) {
        this.submitButton.onclick = function () {
            _this.processMCMASubmission();
        };
    } else {
        this.submitButton.onclick = function () {
            _this.processMCMFSubmission();
        };
    } // end else
    this.optsForm.appendChild(this.submitButton);

    // Create compare button
    this.compareButton = document.createElement("button");
    $(this.compareButton).attr({
        "class": "btn btn-default",
        "id": this.divid + "_bcomp",
        "disabled": "",
        "name": "compare"
    });
    this.compareButton.textContent = "Compare me";
    this.compareButton.onclick = function () {
        _this.compareAnswers(_this.divid);
    };
    this.optsForm.appendChild(this.compareButton);
};

MultipleChoice.prototype.renderMCfeedbackDiv = function () {
    this.feedBackDiv = document.createElement("div");
    this.feedBackDiv.id = this.divid + "_feedback";
    this.MCContainer.appendChild(document.createElement("br"));
    this.MCContainer.appendChild(this.feedBackDiv);
};

MultipleChoice.prototype.randomizeAnswers = function () {
    var currentIndex = this.indexArray.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = this.indexArray[currentIndex];
        this.indexArray[currentIndex] = this.indexArray[randomIndex];
        this.indexArray[randomIndex] = temporaryValue;

        var temporaryFeedback = this.feedbackList[currentIndex];
        this.feedbackList[currentIndex] = this.feedbackList[randomIndex];
        this.feedbackList[randomIndex] = temporaryFeedback;
    }
};

/*====================================
=== Repopulation from localstorage ===
====================================*/

MultipleChoice.prototype.restoreLocalAnswers = function () {         // Handles local storage
    if (this.multipleanswers) {
        this.restoreMultipleSelect();
    } else {
        this.restoreRadio();
    }
};

MultipleChoice.prototype.restoreMultipleSelect = function () {
    // This function repopulates MCMA questions with a user"s previous answers,
    // which were stored into local storage.
    var _this = this;
    var len = localStorage.length;
    if (len > 0) {

        var ex = localStorage.getItem(eBookConfig.email + ":" + _this.divid);
        if (ex !== null) {
            var arr = ex.split(";");
            var answers = arr[0].split(",");
            for (var a = 0; a < answers.length; a++) {
                var index = answers[a];
                for (var b = 0; b < this.optionArray.length; b++) {
                    if (this.optionArray[b].input.value == index) {
                        $(this.optionArray[b].input).attr("checked", "true");
                    }
                }
                if (!_this.timed) {
                    this.compareButton.disabled = false;
                }
            } // end for
        } // end if
    } // end if len > 0
};

MultipleChoice.prototype.restoreRadio = function () {
    // This function repopulates a MCMF question with a user"s previous answer,
    // which was previously stored into local storage
    var _this = this;
    var len = localStorage.length;

    // retrieving data from local storage
    if (len > 0) {
        var ex = localStorage.getItem(eBookConfig.email + ":" + _this.divid);
        if (ex !== null) {
            var arr = ex.split(";");
            var index = arr[0];
            for (var b = 0; b < this.optionArray.length; b++) {
                if (this.optionArray[b].input.value == index) {
                    $(this.optionArray[b].input).attr("checked", "true");
                }
            }
            if (!_this.timed) {
                this.compareButton.disabled = false;
            }
        } // end if not null
    } // end if (len > 0)
};

/*===============================
=== Processing MC Submissions ===
===============================*/

MultipleChoice.prototype.processMCMASubmission = function () {
    // Called when the submit button is clicked
    this.getSubmittedOpts();
    this.scoreMCMASubmission();
    this.populateMCMALocalStorage();
    this.provideMCMAFeedback();
    this.logMCMAsubmission();
    this.enableMCcomparison();
};

MultipleChoice.prototype.getSubmittedOpts = function () {
    var given;
    this.singlefeedback = ""; // Used for MCMF questions
    this.feedbackString = ""; // Used for MCMA questions
    this.givenArray = [];
    this.givenlog = "";
    var buttonObjs = this.optsForm.elements.group1;
    for (var i = 0; i < buttonObjs.length; i++) {
        if (buttonObjs[i].checked) {
            given = buttonObjs[i].value;
            this.givenArray.push(given);
            this.feedbackString += given + ": " + this.feedbackList[i] + "<br />";
            this.givenlog += given + ",";
            this.singlefeedback = this.feedbackList[i];
        }
    }
    this.givenArray.sort();
};

MultipleChoice.prototype.scoreMCMASubmission = function () {
    this.correctCount = 0;
    var correctIndex = 0;
    var givenIndex = 0;
    while (correctIndex < this.correctIndexList.length && givenIndex < this.givenArray.length) {
        if (this.givenArray[givenIndex] < this.correctIndexList[correctIndex]) {
            givenIndex++;
        } else if (this.givenArray[givenIndex] === this.correctIndexList[correctIndex]) {
            this.correctCount++;
            givenIndex++;
            correctIndex++;
        } else {
            correctIndex++;
        }
    }
};

MultipleChoice.prototype.populateMCMALocalStorage = function () {
    var storage_arr = [];
    storage_arr.push(this.givenArray);
    storage_arr.push(this.correctIndexList);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));
};

MultipleChoice.prototype.logMCMAsubmission = function () {
    var answerInfo = "answer:" + this.givenlog.substring(0, this.givenlog.length - 1) + ":" + (this.correctCount == this.correctList.length ? "correct" : "no");
    //logBookEvent({"event": "mChoice", "act": answerInfo, "div_id": this.divid});
};

MultipleChoice.prototype.provideMCMAFeedback = function () {
    if (!this.timed) {
        this.renderMCMAFeedBack();
    } else {
        this.feedBackTimedMC();
    }
};

MultipleChoice.prototype.renderMCMAFeedBack = function () {
    var answerStr = "answers";
    var numGiven = this.givenArray.length;
    if (numGiven === 1) {
        answerStr = "answer";
    }
    var numCorrect = this.correctCount;
    var numNeeded = this.correctList.length;
    var feedbackText = this.feedbackString;

    if (numCorrect === numNeeded && numNeeded === numGiven) {
        $(this.feedBackDiv).html("Correct!    <br />" + feedbackText);
        $(this.feedBackDiv).attr("class", "alert alert-success");
    } else {
        $(this.feedBackDiv).html("Incorrect.    " + "You gave " + numGiven +
            " " + answerStr + " and got " + numCorrect + " correct of " +
            numNeeded + " needed.<br /> " + feedbackText);
        $(this.feedBackDiv).attr("class", "alert alert-danger");
    }
};

MultipleChoice.prototype.processMCMFSubmission = function () {
    // Called when the submit button is clicked
    this.getSubmittedOpts();
    this.populateMCMFLocalStorage();
    this.provideMCMFFeedback();
    this.logMCMFsubmission();
    this.enableMCcomparison();
};

MultipleChoice.prototype.scoreMCMFSubmission = function () {
    if (this.givenArray[0] == this.correctIndexList[0]) {
        this.correct = true;
    } else if (this.givenArray[0] != null) { // if given is null then the question wasn"t answered and should be counted as skipped
        this.correct = false;
    }
};

MultipleChoice.prototype.populateMCMFLocalStorage = function () {
    var storage_arr = [];
    storage_arr.push(this.givenArray[0]);
    storage_arr.push(this.correctIndexList[0]);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));
};

MultipleChoice.prototype.logMCMFsubmission = function () {
    var answerInfo = "answer:" + this.givenArray[0] + ":" + (this.givenArray[0] == this.correctIndexList[0] ? "correct" : "no");
    //logBookEvent({"event": "mChoice", "act": answerInfo, "div_id": this.divid});
};

MultipleChoice.prototype.provideMCMFFeedback = function () {
    if (!this.timed) {
        this.renderMCMFFeedback(this.givenArray[0] == this.correctIndexList[0], this.singlefeedback);
    } else {
        this.feedBackTimedMC();
    }
};

MultipleChoice.prototype.renderMCMFFeedback = function (correct, feedbackText) {
    if (correct) {
        $(this.feedBackDiv).html("Correct!    " + feedbackText);
        $(this.feedBackDiv).attr("class", "alert alert-success");
    } else {
        if (feedbackText == null) {
            feedbackText = "";
        }
        $(this.feedBackDiv).html("Incorrect.    " + feedbackText);
        $(this.feedBackDiv).attr("class", "alert alert-danger");
    }
};

MultipleChoice.prototype.enableMCcomparison = function () {
    if (!this.timed) {
        this.compareButton.disabled = false;
    }
};

MultipleChoice.prototype.instructorMchoiceModal = function (data) {
    // data.reslist -- student and their answers
    // data.answerDict    -- answers and count
    // data.correct - correct answer
    var res = "<table><tr><th>Student</th><th>Answer(s)</th></tr>";
    for (var i in data) {
        res += "<tr><td>" + data[i][0] + "</td><td>" + data[i][1] + "</td></tr>";
    }
    res += "</table>";
    return res;
};

MultipleChoice.prototype.compareModal = function (data, status, whatever) {
    var datadict = eval(data)[0];
    var answers = datadict.answerDict;
    var misc = datadict.misc;
    var kl = Object.keys(answers).sort();

    var body = "<table>";
    body += "<tr><th>Answer</th><th>Percent</th></tr>";

    var theClass = "";
    for (var k in kl) {
        if (kl[k] === misc.correct) {
            theClass = "success";
        } else {
            theClass = "info";
        }

        body += "<tr><td>" + kl[k] + "</td><td class='compare-me-progress'>";
        var pct = answers[kl[k]] + "%";
        body += "<div class='progress'>";
        body += "    <div class='progress-bar progress-bar-" + theClass + "' style='width:" + pct + ";'>" + pct;
        body += "    </div>";
        body += "</div></td></tr>";
    }
    body += "</table>";

    if (misc["yourpct"] !== "unavailable") {
        body += "<br /><p>You have " + misc["yourpct"] + "% correct for all questions</p>";
    }

    if (datadict.reslist !== undefined) {
        body += this.instructorMchoiceModal(datadict.reslist);
    }

    var html = "<div class='modal fade'>" +
        "    <div class='modal-dialog compare-modal'>" +
        "        <div class='modal-content'>" +
        "            <div class='modal-header'>" +
        "                <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
        "                <h4 class='modal-title'>Distribution of Answers</h4>" +
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

MultipleChoice.prototype.compareAnswers = function () {
    var data = {};
    data.div_id = this.divid;
    data.course = eBookConfig.course;
    jQuery.get(eBookConfig.ajaxURL + "getaggregateresults", data, this.compareModal);
};

MultipleChoice.prototype.checkCorrectTimedMCMA = function () {
    if (this.correctCount === this.correctList.length && this.correctList.length === this.givenArray.length) {
        this.correct = true;
    } else if (this.givenArray.length !== 0) {
        this.correct = false;
    }
    return this.correct;
};

MultipleChoice.prototype.checkCorrectTimedMCMF = function () {
    return this.correct;
};

MultipleChoice.prototype.feedBackTimedMC = function () {
    var _this = this;
    for (var i = 0; i < this.indexArray.length; i++) {
        var tmpindex = this.indexArray[i];
        var feedbackobj = $("#" + _this.divid + "_eachFeedback_" + tmpindex);
        $(feedbackobj).text(_this.feedbackList[i]);
        var tmpid = _this.answerList[tmpindex].id;
        if (_this.correctList.indexOf(tmpid) >= 0) {
            $(feedbackobj).attr({"class": "alert alert-success"});
        } else {
            $(feedbackobj).attr({"class": "alert alert-danger"});
        }
    }
};

MultipleChoice.prototype.renderTimedIcon = function () {
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
    this.MCContainer.appendChild(timeIconDiv);
};

module.exports = MultipleChoice;
