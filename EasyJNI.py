# -*- coding: utf-8 -*-

import os
import sys
import frida
import codecs

# 打印message
def message(message, data):
    if message["type"] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)


# 连接程序
process = frida.get_remote_device().attach('EasyJNI')
if not os.path.isfile('./EasyJNI.js'):
    raise TypeError("./EasyJNI.js does not exist")
with codecs.open('./EasyJNI.js', 'r', 'UTF-8') as file:
    js_code = file.read()
script = process.create_script(js_code)
script.on("message", message)
script.load()
sys.stdin.read()