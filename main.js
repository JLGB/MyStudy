

console.clear();


let ui_url = 'https://raw.githubusercontent.com/JLGB/MyStudy/main/UI.js';
let help_url = 'https://raw.githubusercontent.com/JLGB/MyStudy/main/helper.js';
let zsy_url = 'https://raw.githubusercontent.com/JLGB/MyStudy/main/zsy.js';

let js_url_list= [ui_url,help_url,zsy_url];


console.info('正在加载脚本中.....');
downloadDialog = dialogs.build({
    title: "正在加载脚本...",
    autoDismiss: false,
    cancelable: true
}).show();

for(var i = 0; i < js_url_list.length; i++){
    js_url = js_url_list[i];
    
    try{
        let fileName = js_url.split('/').pop();
        downloadDialog.content = '正在加载脚本' + i + "/" + js_url_list.length + ".....";
        var x = http.get(js_url).body.string();
        files.write('/sdcard/' + fileName, x);
    }catch(e){
        console.log(e);
        console.error('脚本加载失败，已停止运行');
        exit();
    }
    x = null;
}

downloadDialog.dismiss();
engines.execScriptFile("/sdcard/UI.js");

// engines.execScriptFile("UI.js");




   




