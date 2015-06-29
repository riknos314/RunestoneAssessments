/*===================================
=====================================
==== Begin Timed Assessment Code ====
=====================================
===================================*/
var $ = require("jquery");
var FITB = require("./fitb.js");
var MC = require("./MC.js");

// Timed constructor
function Timed (opts) {
    if (opts) {
        this.init(opts);
    }
}


/*====================================
=== Setting Timed Assess Variables ===
====================================*/

Timed.prototype.init = function (opts) {
    var orig = opts.orig;
    this.origElem = orig; // the entire element of this timed assessment and all it"s children
    this.divid = orig.id;
    this.children = this.origElem.childNodes;
    this.timeLimit = parseInt($(this.origElem).data("time"), 10); // time in seconds to complete the exam
    this.running = 0;
    this.paused = 0;
    this.done = 0;
    this.taken = 0;
    this.score = 0;
    this.incorrect = 0;
    this.skipped = 0;

    this.MCMFList = []; // list of MCMF problems
    this.MCMAList = []; // list of MCMA problems
    this.FITBArray = [];    // list of FIB problems

    this.renderTimedAssess();

};

/*===============================
=== Generating new Timed HTML ===
===============================*/

Timed.prototype.renderTimedAssess = function () {
    this.renderContainer();
    this.renderTimer();
    this.renderControlButtons();
    this.assessDiv.appendChild(this.timedDiv);    // This can"t be appended in renderContainer because then it renders above the timer and control buttons.
    this.renderMCMAquestions();
    this.renderMCMFquestions();
    this.renderFIBquestions();
    this.renderSubmitButton();
    this.renderFeedbackContainer();

    // Replace intermediate HTML with rendered HTML
    $(this.origElem).replaceWith(this.assessDiv);
};

Timed.prototype.renderContainer = function () {
    this.assessDiv = document.createElement("div"); // container for the entire Timed Component
    this.assessDiv.id = this.divid;
    this.timedDiv = document.createElement("div"); // div that will hold the questions for the timed assessment
    var elementHtml = $(this.origElem).html(); // take all of the tags that will generate the questions
    $(this.timedDiv).html(elementHtml); // place those tags in the div
    $(this.timedDiv).attr({ // set the id, and style the div to be hidden
        "id": "timed_Test",
        "style": "display:none"
    });
    this.newChildren = this.timedDiv.childNodes;    // These are the...
    // ...components that need to be rendered inside of the timed test
};

Timed.prototype.renderTimer = function () {
    this.wrapperDiv = document.createElement("div");
    this.timerContainer = document.createElement("P");
    this.wrapperDiv.id = "startWrapper";
    this.timerContainer.id = "output";
    this.wrapperDiv.appendChild(this.timerContainer);
};

Timed.prototype.renderControlButtons = function () {
    var _this = this;
    this.controlDiv = document.createElement("div");
    $(this.controlDiv).attr({
        "id": "controls",
        "style": "text-align: center"
    });
    this.startBtn = document.createElement("btn");
    this.pauseBtn = document.createElement("btn");
    $(this.startBtn).attr({
        "class": "btn btn-default",
        "id": "start"
    });
    this.startBtn.textContent = "Start";
    this.startBtn.onclick = function () {
        _this.startAssessment();
    };
    $(this.pauseBtn).attr({
        "class": "btn btn-default",
        "id": "pause",
        "disabled":"true"
    });
    this.pauseBtn.textContent = "Pause";
    this.pauseBtn.onclick = function () {
        _this.pauseAssessment();
    };
    this.controlDiv.appendChild(this.startBtn);
    this.controlDiv.appendChild(this.pauseBtn);
    this.assessDiv.appendChild(this.wrapperDiv);
    this.assessDiv.appendChild(this.controlDiv);
};

Timed.prototype.renderSubmitButton = function () {
    var _this = this;
    this.buttonContainer = document.createElement("div");
    $(this.buttonContainer).attr({"style": "text-align:center"});
    this.finishButton = document.createElement("button");
    $(this.finishButton).attr({
        "id": "finish",
        "class": "btn btn-inverse"
    });
    this.finishButton.textContent = "Submit answers";
    this.finishButton.onclick = function () {
        _this.finishAssessment();
    };
    this.buttonContainer.appendChild(this.finishButton);
    this.timedDiv.appendChild(this.buttonContainer);
};

Timed.prototype.renderFeedbackContainer = function () {
    this.score = document.createElement("P");
    this.score.id = this.divid + "results";
    this.timedDiv.appendChild(this.score);
};

Timed.prototype.renderMCMFquestions = function () {
    // this finds all the MCMF questions in this timed assessment and calls their constructor method
    // Also adds them to MCMFList
    var _this = this;
    for (var i = 0; i < this.newChildren.length; i++) {
        var tmpChild = this.newChildren[i];
        if ($(tmpChild).is("[data-component=multiplechoice]")) {
            if ($(tmpChild).data("multipleanswers") !== true) {
                _this.MCMFList.push(new MC({"orig": tmpChild}));
            }
        }
    }
};

Timed.prototype.renderMCMAquestions = function () {
    // this finds all the MCMA questions in this timed assessment and calls their constructor method
    // Also adds them to MCMAList
    var _this = this;
    for (var i = 0; i < this.newChildren.length; i++) {
        var tmpChild = this.newChildren[i];
        if ($(tmpChild).is("[data-component=multiplechoice]")) {
            if ($(tmpChild).data("multipleanswers") === true) {
                var newMCMA = new MC({"orig": tmpChild});
                _this.MCMAList.push(newMCMA);
            }
        }
    }
};

Timed.prototype.renderFIBquestions = function () {
    // this finds all the FIB questions in this timed assessment and calls their constructor method
    // Also adds them to FIBList
    var _this = this;
    for (var i = 0; i < this.newChildren.length; i++) {
        var tmpChild = this.newChildren[i];
        if ($(tmpChild).is("[data-component=fillintheblank]")) {
            var newFITB = new FITB({"orig": tmpChild});
            _this.FITBArray.push(newFITB);
        }
    }
};

/*=================================
=== Timer and control Functions ===
=================================*/

Timed.prototype.startAssessment = function () {
    var _this = this;
    this.tookTimedExam();
    if (!_this.taken) {
        $(this.startBtn).attr("disabled", true);
        $(this.pauseBtn).attr("disabled", false);
        if (_this.running === 0 && _this.paused === 0) {
            _this.running = 1;
            $(this.timedDiv).show();
            _this.increment();
            var name = _this.getPageName();
            //logBookEvent({"event": "timedExam", "act": "start", "div_id": name});
            localStorage.setItem(eBookConfig.email + ":timedExam:" + name, "started");
        }
    } else {
        $(this.startBtn).attr("disabled", true);
        $(this.pauseBtn).attr("disabled", true);
        $(this.finishButton).attr("disabled", true);
        _this.running = 0;
        _this.done = 1;
        $(this.timedDiv).show();
        $(this.time).text("Already completed");
        _this.submitTimedProblems();
    }
};

Timed.prototype.pauseAssessment = function () {
    if (this.done === 0) {
        if (this.running === 1) {
            this.running = 0;
            this.paused = 1;
            this.pauseBtn.innerHTML = "Resume";
            $(this.timedDiv).hide();
        } else {
            this.running = 1;
            this.paused = 0;
            this.increment();
            this.pauseBtn.innerHTML = "Pause";
            $(this.timedDiv).show();
        }
    }
};

Timed.prototype.showTime = function () { // displays the timer value
    var mins = Math.floor(this.timeLimit / 60);
    var secs = Math.floor(this.timeLimit) % 60;
    var minsString = mins;
    var secsString = secs;

    if (mins < 10) {
        minsString = "0" + mins;
    }
    if (secs < 10) {
        secsString = "0" + secs;
    }
    var timeString = "Time Remaining    " + minsString + ":" + secsString;

    if (mins <= 0 && secs <= 0) {
        timeString = "Finished";
    }

    this.timerContainer.innerHTML = timeString;
    var timeTips = document.getElementsByClassName("timeTip");
    for (var i = 0; i <= timeTips.length - 1; i++) {
        timeTips[i].title = timeString;
    }
};

Timed.prototype.increment = function () { // increments the timer
    // if running (not paused) and not taken
    if (this.running === 1 && !this.taken) {
        var _this = this;
        setTimeout(function () {
            _this.timeLimit--;
            _this.showTime(_this.timeLimit);
            if (_this.timeLimit > 0) {
                _this.increment();
                // ran out of time
            } else {
                $(this.startBtn).attr({"disabled": "true"});
                $(this.finishButton).attr({"disabled": "true"});
                _this.running = 0;
                _this.done = 1;
                if (_this.taken === 0) {
                    _this.taken = 1;
                    _this.finishAssessment();
                }
            }
        }, 1000);
    }
};

Timed.prototype.checkIfFinished = function () {
    if (this.tookTimedExam()) {
        $(this.startBtn).attr("disabled", true);
        $(this.pauseBtn).attr("disabled", true);
        $(this.finishButton).attr("disabled", true);
        this.resetTimedMCMFStorage();
        $(this.timedDiv).show();
    }
};

Timed.prototype.tookTimedExam = function () {
    // Checks if this exam has been taken before

    $("#output").css({
        "width": "50%",
        "margin": "0 auto",
        "background-color": "#DFF0D8",
        "text-align": "center",
        "border": "2px solid #DFF0D8",
        "border-radius": "25px"
    });

    $(this.score).css({
        "width": "50%",
        "margin": "0 auto",
        "background-color": "#DFF0D8",
        "text-align": "center",
        "border": "2px solid #DFF0D8",
        "border-radius": "25px"
    });

    $(".tooltipTime").css({
        "margin": "0",
        "padding": "0",
        "background-color": "black",
        "color": "white"
    });

    var len = localStorage.length;
    var pageName = this.getPageName();
    var _this = this;
    if (len > 0) {
        if (localStorage.getItem(eBookConfig.email + ":timedExam:" + pageName) !== null) {
            _this.taken = 1;

        }else {
            _this.taken = 0;
        }
    }else {
        _this.taken = 0;
    }
};

Timed.prototype.getPageName = function () {
    var pageName = window.location.pathname.split("/").slice(-1);
    var name = pageName[0];
    return name;
};

Timed.prototype.finishAssessment = function () {
    this.timeLimit = 0;
    this.running = 0;
    this.done = 1;
    this.taken = 1;
    this.submitTimedProblems();
    this.checkScore();
    $(this.pauseBtn).attr("disabled", true);
    this.finishButton.disabled = true;
};

Timed.prototype.submitTimedProblems = function () {
    var _this = this;
    for (var i = 0; i < this.MCMAList.length; i++) {
        _this.MCMAList[i].processMCMASubmission();
    }
    for (var j = 0; j < this.MCMFList.length; j++) {
        _this.MCMFList[j].processMCMFSubmission();
    }
    for (var k = 0; k < this.FITBArray.length; k++) {
        _this.FITBArray[k].checkFITBStorage();
    }
};

Timed.prototype.checkScore = function () {
    var _this = this;

    // Gets the score of each MCMA problem
    for (var i = 0; i < this.MCMAList.length; i++) {
        var correctMCMA = _this.MCMAList[i].checkCorrectTimedMCMA();
        if (correctMCMA) {
            this.score++;
        } else if (correctMCMA == null) {
            this.skipped++;
        } else {
            this.incorrect++;
        }
    }

    // Gets the score of each MCMF problem
    for (var j = 0; j < this.MCMFList.length; j++) {
        var correctMCMF = _this.MCMFList[j].checkCorrectTimedMCMF();
        if (correctMCMF) {
            this.score++;
        } else if (correctMCMF == null) {
            this.skipped++;
        } else {
            this.incorrect++;
        }
    }

    // Gets the score of each FITB problem
    for (var k = 0; k < this.FITBArray.length; k++) {
        var correctFITB = _this.FITBArray[k].checkCorrectTimedFITB();
        if (correctFITB) {
            this.score++;
        } else if (correctFITB == null) {
            this.skipped++;
        } else {
            this.incorrect++;
        }
    }
};

module.exports = Timed;
