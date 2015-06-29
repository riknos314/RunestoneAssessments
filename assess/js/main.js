require("bootstrap-webpack");
var $ = require("jquery");


var FITB = require("./fitb.js");
var MC = require("./MC.js");
var Timed = require("./timed.js");
var FITBList = {};
var mcList = {};    // Multiple Choice dictionary
var TimedList = {};

$(document).ready(function () {
    $("[data-component=timedAssessment]").each(function (index) {
        TimedList[this.id] = new Timed({"orig": this});
    });
    for (var key in TimedList) {
        if (TimedList.hasOwnProperty(key)) {
            var TimedChildren = TimedList[key].origElem.childNodes;
        }
    }

    $("[data-component=fillintheblank]").each(function (index) {    // FITB
        if ($.inArray(this.id, TimedChildren) < 0) { // If the fillintheblank element exists within a timed component, don"t render it here
            FITBList[this.id] = new FITB({"orig": this});
        }
    });

    $("[data-component=multiplechoice]").each(function (index) {    // MC
        if ($.inArray(this.id, TimedChildren) < 0) { // If the MC element exists within a timed component, don"t render it here
            mcList[this.id] = new MC({"orig": this});
        }
    });

});
