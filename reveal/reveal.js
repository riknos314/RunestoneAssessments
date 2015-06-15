 /*
  Created by Isaiah Mayerchak on 6/12/15
  */
function RunestoneBase() {  //Parent function

}

RunestoneBase.prototype.logBookEvent = function(info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function(info) {
    console.log("running " + this.divid);
};
var RevealList = {};  //Reveal dictionary

Reveal.prototype = new RunestoneBase();

//<div> Reveal constructor
function Reveal(opts) {
    if (opts) {
        this.init(opts);
    }
}

Reveal.prototype.init = function(opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;  //entire <div> element
    this.origElem = orig;
    this.divid = orig.id;
    this.dataModal = false;
    this.modalTitle = null;   //is a model dialog vs. inline
  	this.showtitle = null;  //defaults
  	this.hidetitle = null;

  	this.wrapDiv = document.createElement('div'); //wrapper div

    if ($(this.origElem).is('[data-modal]')) {
    	this.dataModal = true;
    }

    this.origContent = $(this.origElem).html();

    this.getButtonTitles();
    this.createShowButton();
    if (this.dataModal) {
    	this.checkForTitle();
    } else {
    	this.createHideButton();
    }
    
}   

Reveal.prototype.getButtonTitles = function() {           //to support old functionality
	this.showtitle = $(this.origElem).data('showtitle');
	if (this.showtitle == undefined) {
		this.showtitle = "Show"; //default
	}
	this.hidetitle = $(this.origElem).data('hidetitle');
	if (this.hidetitle == undefined) {
		this.hidetitle = "Hide"; //default
	}
}

Reveal.prototype.checkForTitle = function() {
	this.modalTitle = $(this.origElem).data('title');
	if (this.modalTitle == undefined) {
		this.modalTitle = "Message from the author"; //default
	}
}

Reveal.prototype.createShowButton = function() {
	//create wrapper div
	var revealDiv = document.createElement('div');    //Div that is hidden that contains content
	revealDiv.id = this.divid;
	this.wrapDiv.appendChild(revealDiv);
	$(revealDiv).html(this.origContent);
	$(revealDiv).hide()
	$(this.origElem).replaceWith(this.wrapDiv);

	var _this = this;
	var sbutt = document.createElement('button');
	sbutt.style = 'margin-bottom:10px';
	sbutt.class = 'btn btn-default reveal_button';
	sbutt.textContent = this.showtitle;
	sbutt.id = this.divid + "_show"
	sbutt.onclick = function() {
		if (_this.dataModal) {
			_this.showModal();
		} else {
			_this.showInline();
			$(this).hide();

		}

	}
	this.wrapDiv.appendChild(sbutt);
}

Reveal.prototype.createHideButton = function() {
	var _this = this;
	var hbutt = document.createElement('button');
	$(hbutt).hide();
	hbutt.textContent = this.hidetitle;
	hbutt.class = 'btn btn-default reveal_button';
	hbutt.id = this.divid + "_hide"
	hbutt.onclick = function() {
		_this.hideInline();
		$(this).hide();
	}
	this.wrapDiv.appendChild(hbutt);

}



Reveal.prototype.showModal = function() {   //Displays popup dialog modal window
	var html = '<div class="modal fade">' +
        '  <div class="modal-dialog compare-modal">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '        <h4 class="modal-title">' + this.modalTitle + '</h4>' +
        '      </div>' +
        '      <div class="modal-body">' +
        this.origContent +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
	el = $(html);
	el.modal();
}


Reveal.prototype.showInline = function () {    //Displays inline version of reveal
	$("#" + this.divid).show();     //revealDiv
	$("#" + this.divid + "_hide").show();
	$("#" + this.divid).find('.CodeMirror').each(function(i, el){el.CodeMirror.refresh()});   //Not sure what this is for

}

Reveal.prototype.hideInline = function() {
	$("#" + this.divid).hide();
	$("#" + this.divid + "_show").show();
}



$(document).ready(function() {
    $('[data-component=reveal]').each(function(index){
        RevealList[this.id] = new Reveal({'orig':this});
    });
});