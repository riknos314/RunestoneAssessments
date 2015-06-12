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
from .assessbase import *
import json
import random


class timedNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """

        Arguments:
        - `self`:
        - `content`:
        """
        super(timedNode,self).__init__()
        self.timed_options = content


def visit_timed_node(self,node):
    res = ""
    res = node.template_start % node.timed_options

    self.body.append(res)

def depart_timed_node(self,node):
    res = ""

    res = node.template_end % node.timed_options

    self.body.append(res)




class StartTimed(Directive):
    """Starts a timed block of assessments"""
    required_arguments = 1
    optional_arguments = 1
    has_content = False
    final_argument_whitespace = True
    option_spec = {'timelimit':directives.unchanged
    }


    def run(self):
        """
            process the timed directive and generate html for output.
            :param self:
            :return:
            .. startTimed:: qname
            :timelimit: Number of seconds student has to complete the timed assessment block
            """

        
        self.options['divid'] = self.arguments[0]

        TEMPLATE_START = '''
            <ul data-component="timedAssessment" data-time="%(timelimit)s" id="%(divid)s">
            '''

        TEMPLATE_END = '''
            '''


        stNode = timedNode(self.options)
        stNode.template_start = TEMPLATE_START
        stNode.template_end = TEMPLATE_END

        self.state.nested_parse(self.content, self.content_offset, timedNode)

        return [stNode]

class EndTimed(Directive):
    """Ends a timed block of assessments"""
    required_arguments = 1
    optional_arguments = 1
    has_content = False
    final_argument_whitespace = True
    option_spec = {}

    def run(self):
        """
            process the timed directive and generate html for output.
            :param self:
            :return:
            .. endTimed:: qname
            """

        
        self.options['divid'] = self.arguments[0]

        TEMPLATE_START = '''
            '''

        TEMPLATE_END = '''
            </ul>
            '''




        etNode = timedNode(self.options)
        etNode.template_start = TEMPLATE_START
        etNode.template_end = TEMPLATE_END

        self.state.nested_parse(self.content, self.content_offset, timedNode)

        return [etNode]