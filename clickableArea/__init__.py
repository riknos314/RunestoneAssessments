# Copyright (C) 2011  Bradley N. Miller
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

__author__ = 'isaiahmayerchak'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive
from .clickerroles import *

def setup(app):
    app.add_directive('clickablearea',ClickableArea)
    app.add_javascript('clickable.js')
    app.add_stylesheet('clickable.css')
    app.add_role('click-correct', clickcorrect)
    app.add_role('click-incorrect', clickincorrect)

    app.add_node(ClickableAreaNode, html=(visit_ca_node, depart_ca_node))


TEMPLATE = """
<pre data-component="clickablearea" id="%(divid)s">
<span data-question>%(question)s</span>%(feedback)sdef main():
	<span data-incorrect>print("Hello world")</span>
	<span data-correct>x = 4</span>
	for i in range(5):
		<span data-correct>y = i</span>
		print(y)
	<span data-incorrect>return 0</span>
	</pre>
"""

class ClickableAreaNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """
        Arguments:
        - `self`:
        - `content`:
        """
        super(ClickableAreaNode,self).__init__()
        self.ca_options = content

# self for these functions is an instance of the writer class.  For example
# in html, self is sphinx.writers.html.SmartyPantsHTMLTranslator
# The node that is passed as a parameter is an instance of our node class.
def visit_ca_node(self,node):
    res = TEMPLATE

    if "feedback" in node.ca_options:
        node.ca_options["feedback"] = "<span data-feedback>" + node.ca_options["feedback"] + "</span>"
    else:
        node.ca_options["feedback"] = ""

    res = res % node.ca_options

    res = res.replace("u'","'")  # hack:  there must be a better way to include the list and avoid unicode strings

    self.body.append(res)

def depart_ca_node(self,node):
    ''' This is called at the start of processing an clickablearea node.  If clickablearea had recursive nodes
        etc and did not want to do all of the processing in visit_ca_node any finishing touches could be
        added here.
    '''
    pass



class ClickableArea(Directive):
    required_arguments = 1
    optional_arguments = 0
    has_content = True
    option_spec = {"question":directives.unchanged,
        "feedback":directives.unchanged
    }

    def run(self):
        """
            process the multiplechoice directive and generate html for output.
            :param self:
            :return:
            .. clickablearea:: identifier
                :question: Question text

                --Content--
        """
        self.options['divid'] = self.arguments[0]

        return [ClickableAreaNode(self.options)]
