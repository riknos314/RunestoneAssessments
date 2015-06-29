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
__author__ = 'isaiahmayerchak'

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
    res = ""

    if 'casei' in node.fitb_options:
        node.fitb_options['casei'] = 'true'
    else:
        node.fitb_options['casei'] = 'false'
    if 'timed' in node.fitb_options:
        node.fitb_options['timed'] = 'data-timed'
    else:
        node.fitb_options['timed'] = ''
    res = node.template_start % node.fitb_options

    self.body.append(res)


def depart_fitb_node(self,node):
    fbl = []
    res = ""
    feedCounter = 0


    for k in sorted(node.fitb_options.keys()):
        if 'feedback' in k:
            feedCounter += 1
            node.fitb_options['feedLabel'] = "feedback" + feedCounter
            pair = eval(node.fitb_options[k])
            p1 = escapejs(pair[1])
            p0 = escapejs(pair[0])
            node.fitb_options['feedExp'] = p0
            node.fitb_options['feedText'] = p1
            res += node.template_option % node.fitb_options

    node.fitb_options['fbl'] = json.dumps(fbl).replace('"',"'")

    self.body.append(res)


class FillInTheBlank(Assessment):
    required_arguments = 1
    optional_arguments = 1
    final_argument_whitespace = True
    has_content = True
    option_spec = {'blankid':directives.unchanged,
        'timed':directives.flag,
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
            :timed: Flag that indicated this is part of a timed block
            :casei: Case insensitive boolean
            Question text
            ...
            """

        TEMPLATE_START = '''
        <p data-component="fillintheblank" data-casei="%(casei)s" id="%(divid)s" %(timed)s>
            '''

        TEMPLATE_END = '''
        </p>
            '''

        super(FillInTheBlank,self).run()

        fitbNode = FITBNode(self.options)
        fitbNode.template_start = TEMPLATE_START
        fitbNode.template_end = TEMPLATE_END

        #self.state.nested_parse(self.content, self.content_offset, fitbNode)

        return [fitbNode]






class BlankNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """

        Arguments:
        - `self`:
        - `content`:
        """
        super(BlankNode,self).__init__()
        self.blank_options = content


def visit_fitb_node(self,node):
    res = ""


    res = node.template_start % node.blank_options

    self.body.append(res)


def depart_fitb_node(self,node):
    fbl = []
    res = ""
    feedCounter = 0


    for k in sorted(node.blank_options.keys()):
        if 'feedback' in k:
            feedCounter += 1
            node.blank_options['feedLabel'] = "feedback" + feedCounter
            pair = eval(node.blank_options[k])
            p1 = escapejs(pair[1])
            p0 = escapejs(pair[0])
            node.blank_options['feedExp'] = p0
            node.blank_options['feedText'] = p1
            res += node.template_blank_option % node.blank_options

    node.blank_options['fbl'] = json.dumps(fbl).replace('"',"'")

    res += node.template_option_end % node.blank_options

    self.body.append(res)




class Blank(Directive):
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True
    has_content = True
    option_spec = {'correct':directives.unchanged,
        'feedback':directives.unchanged,
        'feedback1':directives.unchanged,
        'feedback2':directives.unchanged,
        'feedback3':directives.unchanged,
        'feedback4':directives.unchanged,
        'blankid':directives.unchanged,
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
            :timed: Flag that indicated this is part of a timed block
            :casei: Case insensitive boolean
            Question text
            ...
            """

        TEMPLATE_BLANK_START = '''
        <span data-blank>%(bodytext)s<span data-answer id="%(divid)s_answer">%(correct)s</span>
            '''
        TEMPLATE_BLANK_OPTION = '''
        <span data-feedback="regex" id="%(feedLabel)s">%(feedExp)s</span>
        <span data-feedback="text" for="%(feedLabel)s">%(feedText)s</span>
            '''
        TEMPLATE_BLANK_END = '''
        </span>
        '''


        super(Blank,self).run()

        blankNode = BlankNode(self.options)
        blankNode.template_blank_start = TEMPLATE_BLANK_START
        blankNode.template_blank_option = TEMPLATE_BLANK_OPTION
        blankNode.template_option_end = TEMPLATE_OPTION_END

        #self.state.nested_parse(self.content, self.content_offset, fitbNode)

        return [blankNode]
