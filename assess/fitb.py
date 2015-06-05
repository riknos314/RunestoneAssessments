# Copyright (C) 2013  Bradley N. Miller
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
__author__ = 'bmiller'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive
from .assessbase import *
import json
import random



class FITBNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """

        Arguments:
        - `self`:
        - `content`:
        """
        super(FITBNode,self).__init__()
        self.fitb_options = content


def visit_fitb_node(self,node):
    res = node.template_start % node.fitb_options

    self.body.append(res)
        

def depart_fitb_node(self,node):
    #fbl = []
    #for k in sorted(node.fitb_options.keys()):
    #   if 'feedback' in k:
    #        pair = eval(node.fitb_options[k])
    #        p1 = escapejs(pair[1])
    #        newpair = (pair[0],p1)
    #        fbl.append(newpair)

    res = ""

    for k in sorted(node.fitb_options.keys()):    #Isaiah's for loop
        index = 1
        if 'feedback' in k:
            node.fitb_options['aLabel'] = index
            index += 1
            pair = eval(node.fitb_options[k])
            p0 = pair[0]
            p1 = escapejs(pair[1])
            node.fitb_options['feedExp'] = p0
            node.fitb_options['feedText'] = p1
            res += node.template_option % node.fitb_options
                                                        #Endfor Isaiah's for loop


    if 'casei' in node.fitb_options:
        node.fitb_options['casei'] = 'true'
    else:
        node.fitb_options['casei'] = 'false'
    #node.fitb_options['fbl'] = json.dumps(fbl).replace('"',"'")
    #res = ""
    
    res += node.template_end % node.fitb_options

    self.body.append(res)


class FillInTheBlank(Assessment):
    required_arguments = 1
    optional_arguments = 1
    final_argument_whitespace = True
    has_content = True
    option_spec = {'correct':directives.unchanged,
        'feedback':directives.unchanged,
        'feedback1':directives.unchanged,
        'feedback2':directives.unchanged,
        'feedback3':directives.unchanged,                   
        'feedback4':directives.unchanged,  
        'blankid':directives.unchanged,
        'iscode':directives.flag,
        'casei':directives.flag  # case insensitive matching
    }
    
    def run(self):
        """
            process the fillintheblank directive and generate html for output.
            :param self:
            :return:
            .. fillintheblank:: qname
            :iscode: boolean
            :correct: somestring
            :feedback: -- displayed if wrong
            :feedback: ('.*', 'this is the message')
            Question text
            ...
            """
        
        TEMPLATE_START = '''
            <p data-component="fillintheblank" data-casei="%(casei)s" id="%(divid)s">
                <span data-answer id="%(divid)s_answer">%(answer)s</span>
            '''

        OPTIONS = '''
                <span data-feedback="regex" id="feedback%(aLabel)s">%(feedExp)s</span>
                <span data-feedback="text" for="feedback%(aLabel)s">%(feedText)s</span>
            '''
        
        TEMPLATE_END = '''
            </p>
            '''   
    #<p data-component="fillintheblank" data-casei="false" id="blank-1">
    #    Enter a string that contains the letter 'e'!

    #        <span data-answer id="blank-1_answer">e</span>
    #    <span data-feedback="regex" id="feedback1">.*</span>
    #    <span data-feedback="text" for="feedback1">There''s not an e in that string!</span>
    #</p>
        super(FillInTheBlank,self).run()

        fitbNode = FITBNode(self.options)
        fitbNode.template_start = TEMPLATE_START
        fitbNode.template_option = OPTIONS
        fitbNode.template_end = TEMPLATE_END

        self.state.nested_parse(self.content, self.content_offset, fitbNode)

        return [fitbNode]


