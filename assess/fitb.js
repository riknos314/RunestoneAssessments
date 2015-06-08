 /*
  Created by Isaiah Mayerchak and Kirby Olson on 6/3/15
  */


//start with basic parent stuff

var feedBack = function (divid, correct, feedbackText) {    //Displays feedback on page
    if (correct) {
        $(divid).html('You are Correct!');
        //$(divid).css('background-color', '#C8F4AD');
        $(divid).attr('class','alert alert-success');
    } else {
        if (feedbackText == null) {
            feedbackText = '';
        }
        $(divid).html("Incorrect.  " + feedbackText);
        //$(divid).css('background-color', '#F4F4AD');
        $(divid).attr('class','alert alert-danger');
    }
};



function RunestoneBase() {  //Parent function

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};

var FITBList = {};  //Fill-in-the-blank-dictionary

FITB.prototype = new RunestoneBase();

//<p> FITB constructor
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
    this.checkPreviousFIB();
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
		var tempRegEx = document.getElementById(tempFor).innerHTML;
		tempArr.push(tempRegEx);
		tempArr.push(this.innerHTML);
		_this.feedbackArray.push(tempArr);

	});
}

FITB.prototype.createFITBElement = function() {      //Creates input element that is appended to DOM
	_this = this;
	var inputDiv = document.createElement('div');
	$(inputDiv).text(this.question);
	$(inputDiv).addClass("alert alert-warning");
	inputDiv.id = this.divid;
	var newInput = document.createElement('input');
	var feedbackDiv = document.createElement('div');

	$(newInput).attr({
		'type' : 'text',
		'id' : this.divid + 'blank',
        'class': 'form-control'
		});

	feedbackDiv.id = this.divid + '_feedback';
	var butt = document.createElement('button');         //Check me button
	butt.textContent = "Check Me";
    $(butt).attr({
            "class" : "btn btn-success",
            "name" : "do answer",
        });


    butt.onclick = function() {
        _this.checkFIBStorage();
    }


    var compButt = document.createElement("button");       //Compare me button
    $(compButt).attr({
        "class":"btn btn-default",
        "id":this.origElem.id+"_bcomp",
        "disabled":"",
        "name":"compare",
    });
    compButt.textContent = "Compare Me";
    compButt.onclick = function() {
        _this.compareFITBAnswers();
    }

    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(newInput);
    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(butt);
    inputDiv.appendChild(compButt);

    inputDiv.appendChild(feedbackDiv);

    $(this.origElem).replaceWith(inputDiv);


}

FITB.prototype.checkPreviousFIB = function() {
    // This function repoplulates FIB questions with a user's previous answers,
    // which were stored into local storage

    var len = localStorage.length;
    if (len > 0) {
    	var ex = localStorage.getItem(eBookConfig.email + ":" + this.divid);
    	if (ex !== null) {
           var arr = ex.split(";");
           var str = this.divid + "blank";
           $("#" + str).attr("value", arr[0]);
           document.getElementById(this.divid + '_bcomp').disabled = false;
        } // end if ex not null
    } // end if len > 0
};

FITB.prototype.checkFIBStorage = function() {                //Starts chain of functions which ends with feedBack() displaying feedback to user
    var given = document.getElementById(this.divid + "blank").value;
    // update number of trials??
    // log this to the db
    modifiers = '';
    if (this.casei) {
        modifiers = 'i'
    }
    var patt = RegExp(this.correctAnswer, modifiers);
    var isCorrect = patt.test(given);
    if (!isCorrect) {
        fbl = this.feedbackArray;
        for (var i = 0; i < fbl.length; i++) {
            patt = RegExp(fbl[i][0]);
            if (patt.test(given)) {
                fbl = fbl[i][1];
                break;
            }
        }
    }
    // store the answer in local storage
    var storage_arr = new Array();
    storage_arr.push(given);
    storage_arr.push(this.correctAnswer);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));

    feedBack('#' + this.divid + '_feedback', isCorrect, this.feedbackArray);
    var answerInfo = 'answer:' + given + ":" + (isCorrect ? 'correct' : 'no');
    logBookEvent({'event': 'fillb', 'act': answerInfo, 'div_id': this.divid});
    document.getElementById(this.divid + '_bcomp').disabled = false;
};


FITB.prototype.compareFITBAnswers = function() {       //Called by compare me button--calls compareFITB
    data = {};
    data.div_id = this.divid;
    data.course = eBookConfig.course;
    jQuery.get(eBookConfig.ajaxURL + 'gettop10Answers', data, this.compareFITB);
}

FITB.prototype.compareFITB = function(data, status, whatever) {
    var answers = eval(data)[0];
    var misc = eval(data)[1];

    var body = '<table>';
    body += '<tr><th>Answer</th><th>Count</th></tr>';

    for (var row in answers) {
        body += '<tr><td>' + answers[row].answer + '</td><td>' + answers[row].count + ' times</td></tr>';
    }
    body += '</table>';
    if (misc['yourpct'] !== 'unavailable') {
        body += '<br /><p>You have ' + misc['yourpct'] + '% correct for all questions</p>';
    }

    var html = '<div class="modal fade">' +
        '  <div class="modal-dialog compare-modal">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '        <h4 class="modal-title">Top Answers</h4>' +
        '      </div>' +
        '      <div class="modal-body">' +
        body +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    el = $(html);
    el.modal();
}

$(document).ready(function() {
    $('[data-component=fillintheblank]').each(function(index){
        FITBList[this.id] = new FITB({'orig':this});
    });

});
