/*==========================================
=======     Master clickable.js     ========
============================================
===   This file contains the JS for the  ===
===  Runestone clickable area component. ===
============================================
===              Created by              ===
===           Isaiah Mayerchak           ===
===                7/1/15                ===
==========================================*/
function RunestoneBase () {   // Basic parent stuff

}
RunestoneBase.prototype.logBookEvent = function (info) {
    console.log("logging event " + this.divid);
};
RunestoneBase.prototype.logRunEvent = function (info) {
    console.log("running " + this.divid);
};

var CAList = {};    // Dictionary that contains all instances of ClickableArea objects


function ClickableArea (opts) {
    if (opts) {
        this.init(opts);
    }
}

ClickableArea.prototype = new RunestoneBase();

/*========================================
== Initialize basic ClickableArea attributes ==
========================================*/
ClickableArea.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <pre> element that will be replaced by new HTML
    this.origElem = orig;
    this.divid = orig.id;

    this.correctArray = [];   // holds the IDs of all correct clickable span elements
    this.incorrectArray = [];   // holds IDs of all incorrect clickable span elements


    this.getQuestion();
    this.getFeedback();
    this.renderNewElements();
};

ClickableArea.prototype.getQuestion = function () {
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-question]")) {
            this.question = this.origElem.childNodes[i];
            break;
        }
    }
};

ClickableArea.prototype.getFeedback = function () {
    this.feedback = "";
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).is("[data-feedback]")) {
            this.feedback = this.origElem.childNodes[i];
        }
    }
    if (this.feedback !== "") {
        $(this.feedback).remove();
    }
};

ClickableArea.prototype.renderNewElements = function () {
    this.containerDiv = document.createElement("div");
    this.containerDiv.appendChild(this.question);
    $(this.containerDiv).addClass("alert alert-warning");

    this.newPre = document.createElement("pre");
    this.newPre.innerHTML = $(this.origElem).html();
    this.containerDiv.appendChild(this.newPre);

    this.replaceSpanElements();
    this.createButtons();
    this.createFeedbackDiv();

    $(this.origElem).replaceWith(this.containerDiv);

};

ClickableArea.prototype.replaceSpanElements = function () {
    for (var i = 0; i < this.newPre.childNodes.length; i++) {
        if ($(this.newPre.childNodes[i]).is("[data-correct]") || $(this.newPre.childNodes[i]).is("[data-incorrect]")) {
            var replaceSpan = document.createElement("span");
            replaceSpan.innerHTML = this.newPre.childNodes[i].innerHTML;
            $(replaceSpan).addClass("clickable");
            replaceSpan.onclick = function () {
                if ($(this).hasClass("clickable-clicked")) {
                    $(this).removeClass("clickable-clicked");
                } else {
                    $(this).addClass("clickable-clicked");
                }
            };

            if ($(this.newPre.childNodes[i]).is("[data-correct]")) {
                this.correctArray.push(replaceSpan);
            } else {
                this.incorrectArray.push(replaceSpan);
            }
            $(this.newPre.childNodes[i]).replaceWith(replaceSpan);
        }
    }
};

ClickableArea.prototype.createButtons = function () {
    this.submitButton = document.createElement("button");    // Check me button
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success",
        "name": "do answer"
    });

    this.submitButton.onclick = function () {
        this.clickableEval();
    }.bind(this);

    this.containerDiv.appendChild(this.submitButton);
};

ClickableArea.prototype.createFeedbackDiv = function () {
    this.feedBackDiv = document.createElement("div");
    this.containerDiv.appendChild(document.createElement("br"));
    this.containerDiv.appendChild(this.feedBackDiv);
};

ClickableArea.prototype.clickableEval = function () {
    this.correct = true;
    for (var i = 0; i < this.correctArray.length; i++) {
        if (!$(this.correctArray[i]).hasClass("clickable-clicked")) {
            this.correct = false;
        }
    }
    for (var i = 0; i < this.incorrectArray.length; i++) {
        if ($(this.incorrectArray[i]).hasClass("clickable-clicked")) {
            this.correct = false;
        }
    }

    this.renderFeedback();
};

ClickableArea.prototype.renderFeedback = function () {

    if (this.correct) {
        $(this.feedBackDiv).html("You are Correct!");
        $(this.feedBackDiv).attr("class", "alert alert-success");

    } else {
        $(this.feedBackDiv).html("Incorrect.    " + this.feedback.innerHTML);

        $(this.feedBackDiv).attr("class", "alert alert-danger");
    }
};

/*=================================
== Find the custom HTML tags and ==
==   execute our code on them    ==
=================================*/
$(document).ready(function () {
    $("[data-component=clickablearea]").each(function (index) {
        CAList[this.id] = new ClickableArea({"orig": this});
    });

});
