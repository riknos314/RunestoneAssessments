   /*
  Created by Isaiah Mayerchak and Kirby Olson on 6/1/15
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

var dfList = {};  //Data File dictionary

DataFile.prototype = new RunestoneBase();

//<pre> constructor
function DataFile(opts) {
	if (opts) {
		this.init(opts);
	}
}

DataFile.prototype.init = function(opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;  //entire <pre> element
    this.origElem = orig;
    this.divid = orig.id;
    this.dataEdit = false
    if ($(this.origElem).data('edit') === true) {
    	this.dataEdit = true
    }
    this.contentText = this.origElem.innerHTML;



$(document).ready(function() {
    $('[data-component=datafile]').each( function(index ){
        dfList[this.id] = new DataFile({'orig':this});
    });

});