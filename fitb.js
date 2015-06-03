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

//<ul> constructor
function FITB(opts) {
	if (opts) {
		this.init(opts);
	}
}

FITB.prototype.init = function(opts) {                 //Finish later
	RunestoneBase.apply(this, arguments);
	var orig = opts.orig;  //entire <p> element
	this.origElem = orig;