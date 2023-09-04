"ui";

importClass(java.net.HttpURLConnection);
importClass(java.net.URL);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
importClass(android.graphics.Color);

ui.layout(
    <vertical>
        <appbar>
                <toolbar id="toolbar" title="{{unescape('好好学习')}}" />
        </appbar>
        {/* <horizontal>
            <text margin="20 10 0 0" textSize="14sp" textColor="black" text="默认延迟:" />
            <spinner id="defaultdelay" margin="0 10 0 0" entries="1秒|2秒|3秒"/>
            <text margin="0 10 0 0" textSize="14sp" textColor="black" text="OCR延迟:" />
            <spinner id="ocrdelay" margin="0 10 20 0" entries="0毫秒|100毫秒|200毫秒|300毫秒|400毫秒|500毫秒"/>
        </horizontal> */}
        <horizontal>
            <button id="stop" margin="20 20 10 0" layout_weight="1" h="120" bg="#FDE6E0" textSize="30sp" />
            <button id="study" margin="10 20 20 0" layout_weight="1" h="120" bg="#C7EDCC" textSize="30sp" />
        </horizontal>
        
        <vertical padding="16">
            <text gravity="left" textColor="black" text="以下答题选中后才会作答" />
            <horizontal>
                <checkbox id="cbDayAnwser"  text="每日答题"/>
                <checkbox id="cbTiaoZhan"  text="趣味答题"/>
                {/* <checkbox id="cbZhuanXiangAnswer"  text="专项答题"/>
                <checkbox id="cbWeekAnwser"  text="每周答题"/> */}
            </horizontal>
            <horizontal>
                <checkbox id="cbVideo"  text="视频学习"/>
                <checkbox id="cbWenZhangGuangBo"  text="文章学习和广播收听"/>
            </horizontal>
           
            <text margin="0 10 0 10" textSize="15sp" text="* 请给app授权 “无障碍” 和 “悬浮窗”权限，有时候答题出现异常，可以根据悬浮窗提示来操作"  />

            <text margin="0 10 0 0"  text="* 更新“学习强国APP”到最新版本， 双人/四人答题，默认都选第一题"  />
            {/* <text id="old_version_app" textColor="blue" text=" 学习强国v2.33版本"  /> */}
        </vertical>

        
    </vertical>
);

ui.study.setText("开 始\n学 习");
ui.stop.setText("结 束\n运 行");
// ui.old_version_app.setText("学习强国v3.22版本 点击下载");


http.__okhttp__.setTimeout(10000);

var CONFIG = storages.create("CONFIG");



// ui.defaultdelay.setSelection(CONFIG.get("DEFAULT_DELAY", 0));
// ui.ocrdelay.setSelection(CONFIG.get("OCR_DELAY", 0));

var thread = null;

ui.cbDayAnwser.setChecked(CONFIG.get("DAY_ANSER_CHECK",true));

ui.cbWenZhangGuangBo.setChecked( CONFIG.get("WEN_ZHANG_GUANG_BO_CHECK",true));
ui.cbVideo.setChecked(CONFIG.get("VIDEO_CHECK",true));
ui.cbTiaoZhan.setChecked( CONFIG.get("TIAO_ZHAN_ANSER_CHECK",true));
// ui.cb4PersonAnwser.setChecked( CONFIG.get("4_PERSON_ANSER_CHECK",true));
// ui.cb2PersonAnwser.setChecked( CONFIG.get("2_PERSON_ANSER_CHECK",true));

// ui.cbZhuanXiangAnswer.on("check", function (checked) {
//     CONFIG.put("ZHUAN_XIANG_ANSER_CHECK",checked);
// });

// ui.cbWeekAnwser.on("check", function (checked) {
//     CONFIG.put("WEEK_ANSER_CHECK",checked);
// });

// ui.cb4PersonAnwser.on("check", function (checked) {
//     CONFIG.put("4_PERSON_ANSER_CHECK",checked);
// });

// ui.cb2PersonAnwser.on("check", function (checked) {
//     CONFIG.put("2_PERSON_ANSER_CHECK",checked);
// });

ui.cbTiaoZhan.on("check", function (checked) {
    CONFIG.put("TIAO_ZHAN_ANSER_CHECK",checked);
});

ui.cbWenZhangGuangBo.on("check", function (checked) {
    CONFIG.put("WEN_ZHANG_GUANG_BO_CHECK",checked);
});

ui.cbDayAnwser.on("check", function (checked) {
    CONFIG.put("DAY_ANSER_CHECK",checked);
});

ui.cbVideo.on("check", function (checked) {
    CONFIG.put("VIDEO_CHECK",checked);
});

var helper_script_execution;
ui.study.click(function () {
    var auto_right = false;
    try{
        textContains('开 始').exists();
        auto_right = true;
    }catch(e){
        auto_right = false;
        console.log("请授权app ”无障碍权限“ 后再开始答题");
    }

    if(auto_right){
        if(helper_script_execution){
            console.hide();
            helper_script_execution.getEngine().forceStop();
            helper_script_execution = null;
        }
        helper_script_execution =  engines.execScriptFile("helper.js");
        // helper_script_execution = engines.execScriptFile("/sdcard/helper.js");
    }
});

ui.stop.click(function () {
    
    // stop_help_js();
    console.hide();
    console.log('答题结束');
    engines.stopAll()
    exit();
});

// ui.old_version_app.click(function () {
//     app.openUrl('http://124.223.169.251:8897/resource/apk/学习强国v2.33.0.apk');
// });



//打开下载进度面板
function download() {
    downloadDialog = dialogs.build({
        title: "正在下载...",
        progress: {
            max: 100,
            showMinMax: true
        },
        autoDismiss: false,
        cancelable: false
    }).show();
    startDownload();
}

//下载apk的主方法体
function startDownload() {
    threads.start(function () {
        var path = files.cwd() + "/new.apk";
        let apkFile = new File(path);
        var conn = new URL(apkurl).openConnection();
        conn.connect();
        let is = conn.getInputStream();
        let length = conn.getContentLength();
        let fos = new FileOutputStream(apkFile);
        let count = 0;
        let buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
        while (true) {
            var p = ((count / length) * 100);
            let numread = is.read(buffer);
            count += numread;
            // 下载完成
            if (numread < 0) {
                toast("下载完成");
                downloadDialog.dismiss();
                downloadDialog = null;
                break;
            }
            // 更新进度条
            downloadDialog.setProgress(p);
            fos.write(buffer, 0, numread);
        }
        fos.close();
        is.close();
        //自动打开进行安装
        app.viewFile(path);
    })
}
