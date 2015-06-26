/*==========================================
=======     Master codelens.js      ========
============================================
===     This file contains the JS for    ===
===   the Runestone Codelens component.  ===
============================================
===              Created by              ===
===           Isaiah Mayerchak           ===
===               06/22/15               ===
==========================================*/

function RunestoneBase () {    // Basic parent stuff

}

RunestoneBase.prototype.logBookEvent = function (info) {
    console.log("logging event " + this.divid);
};

RunestoneBase.prototype.logRunEvent = function (info) {
    console.log("running " + this.divid);
};

var CLList = {};    // Dictionary that contains all instances of CodeLens objects

function CodeLens (opts) {
    if (opts) {
        this.init(opts);
    }
}
CodeLens.prototype = new RunestoneBase();
/*========================================
== Initialize basic CodeLens attributes ==
========================================*/
CodeLens.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <pre> element that will be replaced by new HTML
    this.origElem = orig;
    this.divid = orig.id;
    this.captionText = null;

    this.getCaptionText();

    this.createHTML();

};

CodeLens.prototype.getCaptionText = function () {
    this.captionText = $(this.origElem).data("caption");
    if (this.captionText === undefined) {
        this.captionText = "";
    }
};

CodeLens.prototype.createHTML = function () {
    this.containingDiv = document.createElement("div");

    this.visDiv = document.createElement("div");
    $(this.visDiv).addClass("alert alert-warning cd_section");
    this.containingDiv.appendChild(this.visDiv);

    this.innervDiv = document.createElement("div");
    this.innervDiv.id = this.divid;
    this.visDiv.appendChild(this.innervDiv);

    this.pElement = document.createElement("p");
    $(this.pElement).addClass("cl_caption");
    this.innervDiv.appendChild(this.pElement);

    this.captionSpan = document.createElement("span");
    $(this.captionSpan).addClass("cl_caption_text");
    this.captionSpan.innerHTML = this.captionText + " " + this.divid;
    this.pElement.appendChild(this.captionSpan);

    $(this.origElem).replaceWith(this.containingDiv);

    this.newJS();
};

CodeLens.prototype.newJS = function () {
    var _this = this;
    $(document).ready(function () {
        try {
            _this.execVis = new ExecutionVisualizer(_this.divid, _this.divid + "_trace",
                                                                            {embeddedMode: true,
                                                                            verticalStack: false,
                                                                            heightChangeCallback: redrawAllVisualizerArrows,
                                                                            codeDivWidth: 500,
                                                                            lang: "python"
                                                                            });
            attachLoggers(_this.execVis, _this.divid);
            styleButtons(_this.divid);
            allVisualizers.push(_this.execVis);
        } catch (e) {
            console.log("Failed to Initialize CodeLens component " + _this.divid);
            console.log(e.toString());
        }
    });
    $(document).ready(function () {
        $("#" + _this.divid + "_tracecheck").click(function () {
                _this.logBookEvent({"event": "codelens", "act": "check", "div_id": _this.divid});
            });
    });
    if (allVisualizers === undefined) {
        var allVisualizers = [];
    }
    $(window).resize(function () {
        this.execVis.redrawConnectors();
    });
};
/*

VIS = """
<div class='alert alert-warning cd_section'>
<div id='%(divid)s'></div>
<p class='cl_caption'><span class='cl_caption_text'>%(caption)s (%(divid)s)</span> </p>
</div>"""

QUESTION = """
<div id='%(divid)s_modal' class='modal fade codelens-modal'>
    <div class='modal-dialog'>
        <div class='modal-content'>
            <div class='modal-header'>
                <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>
                <h4 class='modal-title'>Check your understanding</h4>
            </div>
            <div class='modal-body'>
                <p>%(question)s</p>
                <input id='%(divid)s_textbox' type='textbox' class='form-control' style='width:200px;' />
                <br />
                <button id='%(divid)s_tracecheck' class="btn btn-default tracecheck" onclick='traceQCheckMe("%(divid)s_textbox","%(divid)s","%(correct)s")'>
                    Check Me
                </button>
                <button type='button' class='btn btn-default' data-dismiss='modal'>Continue</button>
                <br />
                <p id='%(divid)s_feedbacktext' class='feedbacktext alert alert-warning'></p>
            </div>
        </div>
    </div>
</div>
"""

DATA = """
<script type='text/javascript'>
%(tracedata)s
var %(divid)s_vis;
$(document).ready(function() {
        try {
                %(divid)s_vis = new ExecutionVisualizer("%(divid)s",%(divid)s_trace,
                                                                        {embeddedMode: %(embedded)s,
                                                                        verticalStack: false,
                                                                        heightChangeCallback: redrawAllVisualizerArrows,
                                                                        codeDivWidth: 500,
                                                                        lang : "%(python)s"
                                                                        });
                attachLoggers(%(divid)s_vis,"%(divid)s");
                styleButtons("%(divid)s");
                allVisualizers.push(%(divid)s_vis);
        } catch (e) {
                console.log('Failed to Initialize CodeLens component %(divid)s_vis' );
                console.log(e.toString());
        }
});
$(document).ready(function() {
        $('#%(divid)s_tracecheck').click(function() {
                logBookEvent({"event":"codelens", "act": "check", "div_id":"%(divid)s"});
        });
});
if (allVisualizers === undefined) {
     var allVisualizers = [];
}
$(window).resize(function() {
        %(divid)s_vis.redrawConnectors();
});
</script>
"""
*/

$(document).ready(function () {
    $("[data-component=codelens]").each(function (index) {
        CLList[this.id] = new CodeLens({"orig": this});
    });

});
