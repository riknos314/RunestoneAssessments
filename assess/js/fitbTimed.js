// extension of fitb.js that adds the methods required to make it play nicely with timed assessments
// created by Kirby Olson on 29-June-2015

var $ = require("jquery");

var FITB = require("./fitb.js");

function timedFITB (opts) {
    if (opts) {
        this.timedinit(opts);
    }
}

timedFITB.prototype = new FITB();

timedFITB.prototype.timedinit = function (opts) {
    this.FITBinit(opts); // Construct the FITB object
    this.renderTimedIcon();
    this.hideButtons(); // Don't show per-question buttons in a timed assessment
};

timedFITB.prototype.renderTimedIcon = function () {
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

timedFITB.prototype.hideButtons = function () {
    this.buttonDiv.style.display = "none";
};

timedFITB.prototype.checkCorrectTimedFITB = function () {
    // Returns if the question was correct.    Used for timed assessment grading.
    return this.correct;
};

module.exports = timedFITB;
