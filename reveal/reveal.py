__author__ = 'isaiahmayerchak'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive

def setup(app):
    app.add_directive('reveal', RevealDirective)

    app.add_javascript('reveal.js')

    app.add_node(RevealNode, html=(visit_reveal_node, depart_reveal_node))

class RevealNode(nodes.General, nodes.Element):
    def __init__(self,content):
        super(RevealNode,self).__init__()
        self.reveal_options = content


def visit_reveal_node(self, node):

    if 'modal' in node.reveal_options:
        node.reveal_options['modal'] = 'data-modal'
    else:
        node.reveal_options['modal'] = ''

    if 'modaltitle' in node.reveal_options:
        temp = node.reveal_options['modaltitle']
        node.reveal_options['modaltitle'] = '''data-title=''' + '"' + temp + '"'
    else:
        node.reveal_options['modaltitle'] = ''

    print(node.reveal_options)
    res = TEMPLATE_START % node.reveal_options
    self.body.append(res)

def depart_reveal_node(self,node):
    res = TEMPLATE_END % node.reveal_options

    self.body.append(res)

TEMPLATE_START = '''
    <div data-component="reveal" id="%(divid)s" %(modal)s %(modaltitle)s %(showtitle)s %(hidetitle)s>
    '''
TEMPLATE_END = '''
    </div>
    '''
class RevealDirective(Directive):
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = True
    has_content = True
    option_spec = {"showtitle":directives.unchanged,
                   "hidetitle":directives.unchanged,
                   "modal":directives.flag,
                   "modaltitle":directives.unchanged}

    def run(self):
        """
            process the multiplechoice directive and generate html for output.
            :param self:
            :return:
            .. reveal:: identifier
            :showtitle: Text on the 'show' button--default is "Show"
            :hidetitle: Text on the 'hide' button--default is "Hide"
            :modal: Boolean--if included, revealed display will be a modal
            :modaltitle: Title of modal dialog window--default is "Message from the author"
           
            Content
            ...
            """
        self.assert_has_content() # an empty reveal block isn't very useful...

        if not 'showtitle' in self.options:
            self.options['showtitle'] = 'data-showtitle="Show"'
        else:
            self.options['showtitle'] = '''data-showtitle=''' + '"' + self.options['showtitle'] + '"'
        if not 'hidetitle' in self.options:
            self.options['hidetitle'] = 'data-hidetitle="Hide"'
        else:
            self.options['hidetitle'] = '''data-hidetitle=''' + '"' + self.options['hidetitle'] + '"'

        self.options['divid'] = self.arguments[0]

        reveal_node = RevealNode(self.options)

        self.state.nested_parse(self.content, self.content_offset, reveal_node)

        return [reveal_node]