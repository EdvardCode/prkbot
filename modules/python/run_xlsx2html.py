#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import locale
from xlsx2html import xlsx2html

if __name__ == "__main__":
    if sys.platform.startswith('win'):
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    result = xlsx2html(input_file, output_file, locale='ru_RU')
    print(result)