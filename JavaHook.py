# -*- coding: utf-8 -*-

import os
import sys
import frida
import codecs


def message(message, data):
    if message["type"] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)


process = frida.get_remote_device().attach('NDKDemo')
if not os.path.isfile('./JavaHook.js'):
    raise TypeError("./JavaHook.js does not exist")
with codecs.open('./JavaHook.js', 'r', 'UTF-8') as file:
    js_code = file.read()
script = process.create_script(js_code)
script.on("message", message)
script.load()
# script.exports.test()
# script.exports.test()
# script.exports.test()
# script.exports.test()
sys.stdin.read()


# frida使用非标准端口
# /data/local/tmp # ./fs_12.7.22_arm64 -l 127.0.0.1:31928  默认端口: 27046
# process = frida.get_device_manager().add_remote_device('127.0.0.1:31928').attach('FridaApp')
# if not os.path.isfile('./JavaHook.js'):
#     raise TypeError("./JavaHook.js does not exist")
# with codecs.open('./JavaHook.js', 'r', 'UTF-8') as file:
#     js_code = file.read()
# script = process.create_script(js_code)
# script.on("message", message)
# script.load()
# sys.stdin.read()
