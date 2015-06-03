 /*
  Created by Isaiah Mayerchak and Kirby Olson on 6/3/15
  */


//start with basic parent stuff
function RunestoneBase() {

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};

var FITBList = {};  //Fill in the blank dictionary

FITB.prototype = new RunestoneBase();

//<p> constructor
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
	this.feedbackArray = [];                           //Array of arrays--each inside array contains 2 elements: the regular expression, then text
	this.correctAnswer = $('[data-answer]').text();         //Correct answer--is a regular expression
	this.casei = false;                               //Case insensitive--boolean
	if ($(this.origElem).data('casei') === true) {
		this.casei = true;
	}

	this.findQuestion();
	this.populateFeedbackArray();
	this.createFITBElement();
    this.restoreLocalAnswers();
}


FITB.prototype.findQuestion = function() {     //Gets question text and puts it into this.question
	var correctAnswerId = $('[data-answer]').attr("id");

	var delimiter = document.getElementById(correctAnswerId).outerHTML;
	var fulltext = $(this.origElem).html();
	var temp = fulltext.split(delimiter);
	this.question = temp[0];
}


FITB.prototype.populateFeedbackArray = function() {    //Populates this.feedbackArray
		_this = this;
	$('[data-feedback=text]').each( function(index) {
		var tempArr = [];
		var tempFor = $(this).attr('for');
		var tempRegEx = document.getElementById(tempFor).innerText;
		tempArr.push(tempRegEx);
		tempArr.push(this.innerText);
		_this.feedbackArray.push(tempArr);

	});
}

FITB.prototype.createFITBElement = function() {      //Creates input element that is appended to DOM
	var inputDiv = document.createElement('div');
	$(inputDiv).text(this.question);
	$(inputDiv).addClass("alert alert-warning");
	inputDiv.id = this.divid;
	var newInput = document.createElement('input');
	var feedbackDiv = document.createElement('div');

	$(newInput).attr({
		'type' : 'text',
		'id' : this.divid + 'blank',
		});

	feedbackDiv.id = this.divid + '_feedback';
	var butt = document.createElement('button');
	butt.textContent = "Check Me";
    $(butt).attr({
            "class" : "btn btn-success",
            "name" : "do answer",
        });

    var tmpid = this.divid;
    var tmpblankid = tmpid+"blank";
    var tmpcorrectAnswer = this.correctAnswer;
    var tmpfeedbackArray = this.feedbackArray;
    var tmpcasei = this.casei;

    butt.onclick = function() {
        checkFIBStorage(tmpid,tmpblankid,tmpcorrectAnswer,tmpfeedbackArray,tmpcasei);
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
        compareFITBAnswers(this.divid);
    }

    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(newInput);
    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(butt);
    inputDiv.appendChild(compButt);

    inputDiv.appendChild(feedbackDiv);

    $(this.origElem).replaceWith(inputDiv);


}

FITB.prototype.restoreLocalAnswers = function() {
    checkPreviousFIB(this.divid);
}



$(document).ready(function() {
    $('[data-component=fillintheblank]').each(function(index){
        FITBList[this.id] = new FITB({'orig':this});
    });

});
