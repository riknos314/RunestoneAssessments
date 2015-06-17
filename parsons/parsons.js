  /*
  Created by Isaiah Mayerchak on 6/8/15
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

var prsList = {};  //Parsons dictionary

Parsons.prototype = new RunestoneBase();

//<pre> constructor
function Parsons(opts) {
	if (opts) {
		this.init(opts);
	}
}

Parsons.prototype.init = function(opts) {
	RunestoneBase.apply(this, arguments);
	var orig = opts.orig;  //entire <ul> element
	this.origElem = orig;
    this.divid = orig.id;
    this.contentArray = [];
    this.question = "";

    Parsons.counter++      //Unique identifier

    this.populateContentArray();
    this.getQuestion();
    this.createParsonsView();


}

Parsons.counter = 0;

Parsons.prototype.populateContentArray = function() {
	var content = this.origElem.innerHTML;
	this.contentArray = content.split("---");

	//remove newline characters that precede and follow the --- delimiters
	for (var i=0; i<this.contentArray.length; i++) {
		if (this.contentArray[i][0] == "\n") {
			this.contentArray[i] = this.contentArray[i].slice(1);
		}

		if (this.contentArray[i][this.contentArray[i].length-1] == "\n") {
			this.contentArray[i] = this.contentArray[i].slice(0,-1);
		}
	}
}

Parsons.prototype.getQuestion = function() {    //Finds question text and stores it in this.question
	//pass--depends on future model changes
}




Parsons.prototype.createParsonsView = function() {     //Create DOM elements
	var containingDiv = document.createElement('div');
	containingDiv.class = 'parsons alert alert-warning';
	containingDiv.id = "parsons-" + Parsons.counter;

	//var parsTextDiv = document.createElement('div');
	//parsTextDiv.class = 'parsons-text';
	//parsTextDiv.innerHTML = this.question;

	var leftClearDiv = document.createElement('div');
	leftClearDiv.style = "clear:left";
	containingDiv.appendChild(leftClearDiv);

	var otherDiv = document.createElement('div');
	otherDiv.id = "parsons-orig-" + Parsons.counter;
	//otherDiv.style = "display:none";
	otherDiv.innerHTML = this.origElem.innerHTML;  //Probably not right--just testing
	containingDiv.appendChild(otherDiv);

	var sortContainerDiv = document.createElement('div');
	sortContainerDiv.class = "sortable-code-container";
	containingDiv.appendChild(sortContainerDiv);

	var sortTrashDiv = document.createElement('div');
	sortTrashDiv.id = "parsons-sortableTrash-" + Parsons.counter;
	sortTrashDiv.class = "sortable-code";
	sortContainerDiv.appendChild(sortTrashDiv);

	var sortCodeDiv = document.createElement('div');
	sortCodeDiv.id = "parsons-sortableCode-" + Parsons.counter;
	sortCodeDiv.class = "sortable-code";
	sortContainerDiv.appendChild(sortCodeDiv);

	var otherLeftClearDiv = document.createElement('div');
	otherLeftClearDiv.style = "clear:left";
	sortContainerDiv.appendChild(otherLeftClearDiv);

	var parsonsControlDiv = document.createElement('div');
	parsonsControlDiv.class = "parsons-controls";
	containingDiv.appendChild(parsonsControlDiv);

	var check_butt = document.createElement('button');
	$(check_butt).attr("class", "btn btn-success");
	check_butt.textContent = "Check Me";
	check_butt.id = "checkMe" + Parsons.counter;
	parsonsControlDiv.appendChild(check_butt);

	var reset_butt = document.createElement('button');
	$(reset_butt).attr("class", "btn btn-default");
	reset_butt.textContent = "Reset";
	reset_butt.id = "reset" + Parsons.counter;
	parsonsControlDiv.appendChild(reset_butt);

	var messageDiv = document.createElement('div');
	messageDiv.id = "parsons-message-" + Parsons.counter;
	parsonsControlDiv.appendChild(messageDiv);

	$(this.origElem).replaceWith(containingDiv);








	/*<div class='parsons alert alert-warning' id="parsons-%(unique_id)s">
        <div class="parsons-text">%(qnumber)s: %(instructions)s<br /><br /></div>
        <div style="clear:left;"></div>
        <div id="parsons-orig-%(unique_id)s" style="display:none;">%(code)s</div>
        <div class="sortable-code-container">
        <div id="parsons-sortableTrash-%(unique_id)s" class="sortable-code"></div>
        <div id="parsons-sortableCode-%(unique_id)s" class="sortable-code"></div>
        <div style="clear:left;"></div>
        </div>
        <div class="parsons-controls">
        <input type="button" class='btn btn-success' id="checkMe%(unique_id)s" value="Check Me"/>
        <input type="button" class='btn btn-default' id="reset%(unique_id)s" value="Reset"/>
        <div id="parsons-message-%(unique_id)s"></div>
        </div>
    </div>
    */
}
















$(document).ready(function() {
    $('[data-component=parsons]').each( function(index ){
        prsList[this.id] = new Parsons({'orig':this});
    });

});
