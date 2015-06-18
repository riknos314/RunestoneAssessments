  /*
  Created by Isaiah Mayerchak on 6/8/15
  */
  var _p = _.noConflict();
// start with basic parent stuff
function RunestoneBase () {

}

RunestoneBase.prototype.logBookEvent = function (info) {
  console.log('logging event ' + this.divid);
};

RunestoneBase.prototype.logRunEvent = function (info) {
  console.log('running ' + this.divid);
};

var prsList = {};  // Parsons dictionary

Parsons.prototype = new RunestoneBase();

// <pre> constructor
function Parsons (opts) {
  if (opts) {
    this.init(opts);
  }
}

Parsons.prototype.init = function (opts) {
  RunestoneBase.apply(this, arguments);
  var orig = opts.orig;  //  entire <ul> element
  this.origElem = orig;
  this.divid = orig.id;
  this.contentArray = [];
  this.question = '';

  Parsons.counter++;      //  Unique identifier

  this.populateContentArray();
  this.getQuestion();
  this.createParsonsView();
};

Parsons.counter = 0;

Parsons.prototype.populateContentArray = function () {
  var content = this.origElem.innerHTML;
  this.contentArray = content.split('---');

  // remove newline characters that precede and follow the --- delimiters
  for (var i = 0; i < this.contentArray.length; i++) {
    if (this.contentArray[i][0] === '\n') {
      this.contentArray[i] = this.contentArray[i].slice(1);
    }
    if (this.contentArray[i][this.contentArray[i].length - 1] === '\n') {
      this.contentArray[i] = this.contentArray[i].slice(0, -1);
    }
  }
};

Parsons.prototype.getQuestion = function () {    // Finds question text and stores it in this.question
	// pass--depends on future model changes
};
Parsons.prototype.createParsonsView = function () {     // Create DOM elements
  var containingDiv = document.createElement('div');
  $(containingDiv).addClass('parsons alert alert-warning');
  containingDiv.id = 'parsons-' + Parsons.counter;

  var parsTextDiv = document.createElement('div');
  $(parsTextDiv).addClass('parsons-text');
  parsTextDiv.innerHTML = 'Sample hardcoded question';
  containingDiv.appendChild(parsTextDiv);

  var leftClearDiv = document.createElement('div');
  leftClearDiv.style['clear'] = 'left';
  containingDiv.appendChild(leftClearDiv);

  var otherDiv = document.createElement('div');
  otherDiv.id = 'parsons-orig-' + Parsons.counter;
  otherDiv.style['display'] = 'none';
  otherDiv.innerHTML = this.contentArray.join('\n');
  containingDiv.appendChild(otherDiv);

  var sortContainerDiv = document.createElement('div');
  $(sortContainerDiv).addClass('sortable-code-container');
  containingDiv.appendChild(sortContainerDiv);

  var sortTrashDiv = document.createElement('div');
  sortTrashDiv.id = 'parsons-sortableTrash-' + Parsons.counter;
  $(sortTrashDiv).addClass('sortable-code');
  sortContainerDiv.appendChild(sortTrashDiv);

  var sortCodeDiv = document.createElement('div');
  sortCodeDiv.id = 'parsons-sortableCode-' + Parsons.counter;
  $(sortCodeDiv).addClass('sortable-code');
  sortContainerDiv.appendChild(sortCodeDiv);

  var otherLeftClearDiv = document.createElement('div');
  otherLeftClearDiv.style['clear'] = 'left';
  sortContainerDiv.appendChild(otherLeftClearDiv);

  var parsonsControlDiv = document.createElement('div');
  $(parsonsControlDiv).addClass('parsons-controls');
  containingDiv.appendChild(parsonsControlDiv);

  var check_butt = document.createElement('button');
  $(check_butt).attr('class', 'btn btn-success');
  check_butt.textContent = 'Check Me';
  check_butt.id = 'checkMe' + Parsons.counter;
  parsonsControlDiv.appendChild(check_butt);

  var reset_butt = document.createElement('button');
  $(reset_butt).attr('class', 'btn btn-default');
  reset_butt.textContent = 'Reset';
  reset_butt.id = 'reset' + Parsons.counter;
  parsonsControlDiv.appendChild(reset_butt);

  var messageDiv = document.createElement('div');
  messageDiv.id = 'parsons-message-' + Parsons.counter;
  parsonsControlDiv.appendChild(messageDiv);

  $(this.origElem).replaceWith(containingDiv);

  this.newJS();
};

Parsons.prototype.newJS = function () {
  var _self = this;
  $(document).ready(function(){
            $("#parsons-" + Parsons.counter).not(".sortable-code").not(".parsons-controls").on("click", function(){
                 $('html, body').animate({
                    scrollTop: ($("#parsons-" + Parsons.counter).offset().top - 50)
                }, 700);
            }).find(".sortable-code, .parsons-controls").click(function(e) {
                return false;
                });
            var msgBox = $("#parsons-message-" + Parsons.counter);
            msgBox.hide();
        var displayErrors = function (fb) {
            if(fb.errors.length > 0) {
                    var hash = _self.pwidget.getHash("#ul-parsons-sortableCode-" + Parsons.counter);
                    msgBox.fadeIn(500);
                    msgBox.attr('class','alert alert-danger');
                    msgBox.html(fb.errors[0]);
                    logBookEvent({'event':'parsons', 'act':hash, 'div_id': _self.divid});
            } else {
                    logBookEvent({'event':'parsons', 'act':'yes', 'div_id': _self.divid});
                    msgBox.fadeIn(100);
                    msgBox.attr('class','alert alert-success');
                    msgBox.html("Perfect!")
                }
        }
        $(window).load(function() {
            // set min width and height
            var sortableul = $("#ul-parsons-sortableCode-" + Parsons.counter);
            var trashul = $("#ul-parsons-sortableTrash-" + Parsons.counter);
            var sortableHeight = sortableul.height();
            var sortableWidth = sortableul.width();
            var trashWidth = trashul.width();
            var trashHeight = trashul.height();
            var minHeight = Math.max(trashHeight,sortableHeight);
            var minWidth = Math.max(trashWidth, sortableWidth);
            trashul.css("min-height",minHeight + "px");
            sortableul.css("min-height",minHeight + "px");
            sortableul.height(minHeight);
            trashul.css("min-width",minWidth + "px");
            sortableul.css("min-width",minWidth + "px");
        });
        _self.pwidget = new ParsonsWidget({
                'sortableId': 'parsons-sortableCode-' + Parsons.counter,
        'trashId': 'parsons-sortableTrash-' + Parsons.counter,
                'max_wrong_lines': 1,
                'solution_label': 'Drop blocks here',
                'feedback_cb' : displayErrors
        });
        _self.pwidget.init($("#parsons-orig-" + Parsons.counter).text());
    _self.pwidget.shuffleLines();

        if(localStorage.getItem(_self.divid) && localStorage.getItem(_self.divid + '-trash')) {
            try {
                var solution = localStorage.getItem(_self.divid);
                var trash = localStorage.getItem(_self.divid + '-trash');
                _self.pwidget.createHTMLFromHashes(solution,trash);
                _self.pwidget.getFeedback();
            } catch(err) {
                var text = "An error occured restoring old " + _self.divid + " state.  Error: ";
                console.log(text + err.message);
            }
        }
            $("#reset" + Parsons.counter).click(function(event){
              event.preventDefault();
              _self.pwidget.shuffleLines();

            // set min width and height
            var sortableul = $("#ul-parsons-sortableCode-" + Parsons.counter);
            var trashul = $("#ul-parsons-sortableTrash-" + Parsons.counter);
            var sortableHeight = sortableul.height();
            var sortableWidth = sortableul.width();
            var trashWidth = trashul.width();
            var trashHeight = trashul.height();
            var minHeight = Math.max(trashHeight,sortableHeight);
            var minWidth = Math.max(trashWidth, sortableWidth);
            trashul.css("min-height",minHeight + "px");
            sortableul.css("min-height",minHeight + "px");
            trashul.css("min-width",minWidth + "px");
            sortableul.css("min-width",minWidth + "px");
              msgBox.hide();
            });
            $("#checkMe" + Parsons.counter).click(function(event){
              event.preventDefault();
              var hash = _self.pwidget.getHash("#ul-parsons-sortableCode-" + Parsons.counter);
              localStorage.setItem(_self.divid,hash);
              hash = _self.pwidget.getHash("#ul-parsons-sortableTrash-" + Parsons.counter);
              localStorage.setItem(_self.divid + '-trash',hash);

            _self.pwidget.getFeedback();
            msgBox.fadeIn(100);

            });

        });
}

$(document).ready(function () {
  $('[data-component=parsons]').each(function (index) {
    prsList[this.id] = new Parsons({'orig': this});
  });

});
