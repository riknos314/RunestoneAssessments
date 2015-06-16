/*==========================================
=======      Master reveal.js       ========
============================================
===     This file contains the JS for    ===
===     the Runestone reval component.   ===
============================================
===              Created by              ===
===           Isaiah Mayerchak           ===
===               06/12/15               ===
==========================================*/
function RunestoneBase () {  // Parent function

}

RunestoneBase.prototype.logBookEvent = function (info) {
  console.log('logging event ' + this.divid);
};

RunestoneBase.prototype.logRunEvent = function (info) {
  console.log('running ' + this.divid);
};
var RevealList = {};   // Dictionary that contains all instances of Reveal objects

Reveal.prototype = new RunestoneBase();

// Define Reveal object
function Reveal (opts) {
  if (opts) {
    this.init(opts);
  }
}

/*======================================
== Initialize basic Reveal attributes ==
========================================*/
Reveal.prototype.init = function (opts) {
  RunestoneBase.apply(this, arguments);
  var orig = opts.orig;   // entire <div> element that will be replaced by new HTML
  this.origElem = orig;
  this.divid = orig.id;
  this.dataModal = false;   // is a model dialog vs. inline
  if ($(this.origElem).is('[data-modal]')) {
    this.dataModal = true;
  }
  this.modalTitle = null;
  this.showtitle = null;   // Title of button that shows the concealed data
  this.hidetitle = null;
  this.origContent = $(this.origElem).html();

  this.getButtonTitles();
  this.createShowButton();

  if (this.dataModal) {
    this.checkForTitle();
  } else {
    this.createHideButton();   // Hide button is already implemented in modal dialog
  }
};

/*====================================
== Get text for buttons/modal title ==
====================================*/
Reveal.prototype.getButtonTitles = function () {   // to support old functionality
  this.showtitle = $(this.origElem).data('showtitle');
  if (this.showtitle === undefined) {
    this.showtitle = 'Show';   // default
  }
  this.hidetitle = $(this.origElem).data('hidetitle');
  if (this.hidetitle === undefined) {
    this.hidetitle = 'Hide';   // default
  }
};

Reveal.prototype.checkForTitle = function () {
  this.modalTitle = $(this.origElem).data('title');
  if (this.modalTitle === undefined) {
    this.modalTitle = 'Message from the author';   // default
  }
};

/*============================
== Create show/hide buttons ==
============================*/
Reveal.prototype.createShowButton = function () {
  var _this = this;
  this.wrapDiv = document.createElement('div');   // wrapper div
  this.revealDiv = document.createElement('div');   // Div that is hidden that contains content
  this.revealDiv.id = this.divid;
  this.wrapDiv.appendChild(this.revealDiv);

  // Get original content, put it inside revealDiv and replace original div with revealDiv
  $(this.revealDiv).html(this.origContent);
  $(this.revealDiv).hide();
  $(this.origElem).replaceWith(this.wrapDiv);

  this.sbutt = document.createElement('button');
  this.sbutt.style = 'margin-bottom:10px';
  this.sbutt.class = 'btn btn-default reveal_button';
  this.sbutt.textContent = this.showtitle;
  this.sbutt.id = this.divid + '_show';
  this.sbutt.onclick = function () {
    if (_this.dataModal) {   // Display the data either inline or in a modal dialog
      _this.showModal();
    } else {
      _this.showInline();
      $(this).hide();

    }
  };
  this.wrapDiv.appendChild(this.sbutt);
};

Reveal.prototype.createHideButton = function () {
  var _this = this;
  this.hbutt = document.createElement('button');
  $(this.hbutt).hide();
  this.hbutt.textContent = this.hidetitle;
  this.hbutt.class = 'btn btn-default reveal_button';
  this.hbutt.id = this.divid + '_hide';
  this.hbutt.onclick = function () {
    _this.hideInline();
    $(this).hide();
  };
  this.wrapDiv.appendChild(this.hbutt);

};

/*=================
=== Modal logic ===
=================*/
Reveal.prototype.showModal = function () {   // Displays popup dialog modal window
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
  var el = $(html);
  el.modal();
};

/*==================
=== Inline logic ===
==================*/
Reveal.prototype.showInline = function () {   // Displays inline version of reveal
  $(this.revealDiv).show();
  $(this.hbutt).show();
  $(this.revealDiv).find('.CodeMirror').each(function (i, el) {el.CodeMirror.refresh(); });

};

Reveal.prototype.hideInline = function () {
  $(this.revealDiv).hide();
  $(this.sbutt).show();
};

/*=================================
== Find the custom HTML tags and ==
==   execute our code on them    ==
=================================*/
$(document).ready(function () {
  $('[data-component=reveal]').each(function (index) {
    RevealList[this.id] = new Reveal({'orig': this});
  });
});
