// HOOK普通方法、静态方法
function Test01(){
    let loginActivity = Java.use('com.yijincc.ndkdemo.LoginActivity');
    loginActivity.login.implementation = function () {
        console.log("=============login===============");
        console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()));
        console.log(arguments[0]);
        console.log(arguments[1]);
        this.login(arguments[0],arguments[1]);
    }
}

// HOOK构造方法、重载方法
function Test02(){
    let intent = Java.use('android.content.Intent');
    intent.$init.overload('android.content.Context', 'java.lang.Class').implementation = function () {
       console.log("=============intent===============");
       console.log(arguments[0]);
       console.log(arguments[1]);
       this.$init(arguments[0],arguments[1]);
    }
}

// HOOK内部类
function Test03(){
    let loginActivity$1 = Java.use('com.yijincc.ndkdemo.LoginActivity$1');
    loginActivity$1.onClick.implementation = function () {
        console.log("=============onClick===============");
        console.log(arguments[0]);
        this.onClick(arguments[0]);
    }
}

// 主动调用构造方法
function Test04(){
    let money = Java.use('com.yijincc.fridaapp.Money');
    let obj = money.$new(1000,'RMB');
    console.log(obj.getInfo());
}

// 操作对象里面的成员变量
function Test05(){
    let money = Java.use('com.yijincc.fridaapp.Money');
    let obj = money.$new(10000,'RMB');
    console.log(obj.name.value);
    console.log(obj.num.value);

    console.log('===============================');

    obj.name.value = 'RMB';
    obj.num.value = 10000000;
    console.log(obj.name.value);
    console.log(obj.num.value);
}

// 主动调用普通方法
function Test06(){
    let money = Java.use('com.yijincc.fridaapp.Money');
    let obj = money.$new(2000,'RMB');
    console.log(obj.getInfo());
}

// 获取当前类已有的实例实现主动调用普通方法
function Test07(){
    Java.choose('com.yijincc.ndkdemo.MainActivity',{
        onMatch: function(obj){ // 枚举时调用
                console.log(obj);
                console.log(obj.name.value);
                console.log(obj.age.value);
                console.log(obj.sex.value);
                console.log(obj.rand('B',99))
            }, onComplete: function(){ // 枚举完成后调用
                console.log("end");
            }
        });
}

// 主动调用静态方法
function Test08(){
    let mainActivity = Java.use('com.yijincc.ndkdemo.MainActivity');
    console.log(mainActivity.isRel(444,444));
}

// HOOK打印堆栈信息
// function Test09(){
//     let money = Java.use('com.yijincc.fridaapp.Money');
//     money.getInfo.implementation = function () {
//         console.log("=============getInfo===============");
//         console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()));
//         return this.getInfo();
//     }
// }

// HOOK指定类的所有方法
function Test10(){
    let money = Java.use('com.yijincc.ndkdemo.MainActivity');
    let methods = money.class.getDeclaredMethods();
    for(let j = 0; j < methods.length; j++){
        let methodName = methods[j].getName();
        console.log(methodName);
        for(let k = 0; k < money[methodName].overloads.length; k++){
            money[methodName].overloads[k].implementation = function(){
                console.log('==========='+methodName+'===========');
                for(let i = 0; i < arguments.length; i++){
                    console.log(arguments[i]);
                }
                console.log('===========end===========');
                return this[methodName].apply(this, arguments);
            }
        }
    }
}

// 枚举已加载的所有类与枚举类的所有方法
function Test11(){
    let classes = Java.enumerateLoadedClassesSync();
    for(let i = 0; i < classes.length; i++){
        if(classes[i].indexOf("com.") !== -1){
            console.log("clazz："+classes[i]);
            let clazz = Java.use(classes[i]);
            let methods = clazz.class.getDeclaredMethods();
            for(let j = 0; j < methods.length; j++){
                console.log("method："+methods[j]);
            }
        }
    }
}

// hook动态加载dex文件
function Test12(){
    // Java.enumerateLoadedClasses({
    //     onMatch: function (name, handle) {
    //         if (name.indexOf("com.example") >= 0) {
    //             console.log(name);
    //             let class6 = Java.use(name);
    //             class6.check.implementation = function () {
    //                 console.log("check:", this);
    //                 return true;
    //             };
    //         }
    //     }, onComplete: function () {}
    // });

    Java.enumerateClassLoaders({
        onMatch: function (loader) {
            try {
                if (loader.findClass("com.example.androiddemo.Dynamic.DynamicCheck")) {
                    console.log(loader);
                    Java.classFactory.loader = loader;      //切换classloader
                }
            } catch (error) {}
        }, onComplete: function () {}
    });
    let DynamicCheck = Java.use("com.example.androiddemo.Dynamic.DynamicCheck");
    console.log(DynamicCheck);
    DynamicCheck.check.implementation = function () {
        console.log("DynamicCheck.check");
        return true;
    }
}

// 动态加载dex文件
function Test13(){
    // jar -cvf dex.jar com/example/androiddemo/StringUtils.class
    // dx --dex --output=dex.dex dex.jar
    let dex= Java.openClassFile("/data/local/tmp/dex.dex");
    dex.load();
    let stringUtils = Java.use("com.example.androiddemo.StringUtils");
    console.log(stringUtils.tohexString("1234567890"));
}

rpc.exports = {
    test:function () {
        Java.choose('com.yijincc.ndkdemo.MainActivity',{
        onMatch: function(obj){ // 枚举时调用
                console.log(obj);
                console.log(obj.name.value);
                console.log(obj.age.value);
                console.log(obj.sex.value);
                console.log(obj.rand('B',99))
            }, onComplete: function(){ // 枚举完成后调用
                console.log("============end============");
            }
        });
    }
}

Java.perform(function () {
    Test01();
    // Test02(); // 重载方法
    // Test03(); // 内部类
    // Test04()  // 主动调用构造方法,创建一个对象
    // Test07();
    // Test08();
    // Test10(); // 打印所有的方法
    // Test11();
    //Test13();
});
