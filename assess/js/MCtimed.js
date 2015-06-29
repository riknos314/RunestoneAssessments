// extension of MC.js that adds the methods required to make it play nicely with timed assessments
// created by Kirby Olson on 29-June-2015

var $ = require("jquery");

var MC = require("./MC.js");

function timedMC (opts) {
    if (opts) {
        this.timedinit(opts);
    }
}

timedMC.prototype = new MC();

timedMC.prototype.timedinit = function (opts) {
    this.MCinit(opts); // Construct the MC object
    this.renderTimedIcon();
    this.hideButtons(); // Don't show per-question buttons in a timed assessment
};

timedMC.prototype.renderTimedIcon = function () {
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
    this.questionDiv.appendChild(timeIconDiv);
};

timedMC.prototype.hideButtons = function () {
    this.buttonDiv.style.display = "none";
};

timedFITB.prototype.processTimedMCMASubmission = function () {

};

timedFITB.prototype.processTimedMCMFSubmission = function () {

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
/*
// if timed, add a feedback Div for the option
if (this.timed) {
    var feedBackEach = document.createElement("div");
    feedBackEach.id = this.divid + "_eachFeedback_" + k;
    this.optsForm.appendChild(feedBackEach);
}
*/

module.exports = timedMC;
