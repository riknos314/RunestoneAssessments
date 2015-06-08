/*
Created by Isaiah Mayerchak and Kirby Olson on 6/8/15
*/


//start with basic parent stuff

function RunestoneBase() {  //Parent function

}

RunestoneBase.prototype.logBookEvent = function(info) {
console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
console.log("running " + this.divid);
};

var TAlist = {}; //Timed Assessment dictionary


TimedAssess.prototype = new RunestoneBase();

function TimedAssess(opts) {
	if (opts) {
		this.init(opts);
	}
}

TimedAssess.prototype.init = function(opts) {
	RunestoneBase.apply(this, arguments);
	var orig = opts.orig;  //entire <ul> element
    this.origElem = orig;
}
