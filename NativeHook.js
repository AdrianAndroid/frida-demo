// HOOK导出函数
function Test01(){
    let funGetFlag = Module.findExportByName("libphcm.so", "Java_com_ph0en1x_android_1crackme_MainActivity_getFlag");
    send("native: " + funGetFlag);
    Interceptor.attach(funGetFlag, {
        onEnter: function(args){
            send("============getFlag===============");
            send(args[0]);
            send(args[1]);
        },
        onLeave: function(retval){
            send("============result===============");
            send(retval);
            // 获取JNIEnv*
            let env = Java.vm.tryGetEnv();
            // 将jstring 转换 const char*
            let str=env.getStringUtfChars(retval,0);
            send(str.readCString());
        }
    });
}

// HOOK未导出函数
function Test02(){
    // 绝对地址=so模块起始地址(基地址)+偏移地址
    let baseAddr = Module.findBaseAddress("libphcm.so");
    send("baseAddr:"+baseAddr);
    // 指令集 分为ARM指令、thumb指令
    // ARM指令地址不变  thumb指令地址+1 sub_ 开头的函数 这种函数只能使用这种方式来进行
    Interceptor.attach(baseAddr.add(0xFB9), {
        onEnter: function(args){
            send("============encrypt===============");
            send(args[0]);
            send(args[1]);
            send(args[2]);
            console.log(hexdump(args[2], {
                offset: 0,
                length: 16,
                header: true,
                ansi: false
            }));
            // 获取JNIEnv*
            let env = Java.vm.tryGetEnv();
            // 将jstring 转换 const char*
            let str=env.getStringUtfChars(args[2],0);
            send(str.readCString());
        },
        onLeave: function(retval){
            send("============result===============");
            send(retval);
            // 获取JNIEnv*
            let env = Java.vm.tryGetEnv();
            // 将jstring 转换 const char*
            let str=env.getStringUtfChars(retval,0);
            send(str.readCString());
        }
    });
}

// HOOK枚举导入函数信息
function Test03(){
    let imports = Module.enumerateImportsSync("libphcm.so");
    for(let i=0;i<imports.length;i++){
        if(imports[i].name.indexOf('raise') !== -1){
            send(imports[i]);
        }
    }
}

// HOOK枚举导出函数信息
function Test04(){
    let exports = Module.enumerateExportsSync("libphcm.so");
    for(let i=0;i<exports.length;i++){
        if(exports[i].name.indexOf('Java_') !== -1){
            send("name:"+exports[i].name+"  address:"+exports[i].address);
        }
    }
}

// 遍历模块列表信息
function Test05(){
    Process.enumerateModules({
        onMatch: function(exp){
            if(exp.name.indexOf('libphcm.so') !== -1){
                send('enumerateModules find');
                send(exp);
                return 'stop';
            }
        },
        onComplete: function(){
            send('enumerateModules stop');
        }
    });
}

// 读写内存数据
function Test06(){
    let mem_addr=Memory.alloc(20);
    Memory.writeInt(mem_addr,0x12345678);
    // console.log(hexdump(mem_addr));
    console.log(hexdump(mem_addr, {
        offset: 0,
        length: 20,
        header: true,
        ansi: true
    }));
}

// 使用frida api读写文件
function Test07(){
    let file = new File("/data/data/com.ph0en1x.android_crackme/yijincc.txt", "w");
    file.write("hello world!!!\\n");
    file.flush();
    file.close();
}

// 基于主动调用libc.so里面的函数实现文件的读写操作
function Test08(){
    let addr_fopen = Module.findExportByName("libc.so", "fopen");
    let addr_fputs = Module.findExportByName("libc.so", "fputs");
    let addr_fclose = Module.findExportByName("libc.so", "fclose");

    let fopen = new NativeFunction(addr_fopen, "pointer", ["pointer", "pointer"]);
    let fputs = new NativeFunction(addr_fputs, "int", ["pointer", "pointer"]);
    let fclose = new NativeFunction(addr_fclose, "int", ["pointer"]);

    let filename = Memory.allocUtf8String("/data/data/com.ph0en1x.android_crackme/yijincc.txt");
    let open_mode = Memory.allocUtf8String("w");
    let file = fopen(filename, open_mode);

    let buffer = Memory.allocUtf8String("hello world!!!\\n");
    let result = fputs(buffer, file);
    send("fputs:" + result);
    fclose(file);
}

Java.perform(function () {
    Test01();
    // Test02();
    // Test03();
    // Test04();
    // Test05();
    // Test06();
    // Test07();
    // Test08();
})