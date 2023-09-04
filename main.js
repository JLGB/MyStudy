

console.clear();

// http.__okhttp__.setTimeout(10000);

// let ui_url = 'http://124.223.169.251:8897/resource/js/UI.js';
// let help_url = 'http://124.223.169.251:8897/resource/js/helper.js';
// let zsy_url = 'http://124.223.169.251:8897/resource/js/zsy.js';

// let js_url_list= [ui_url,help_url,zsy_url];


// console.info('正在加载脚本中.....');
// downloadDialog = dialogs.build({
//     title: "正在加载脚本...",
//     autoDismiss: false,
//     cancelable: true
// }).show();

// for(var i = 0; i < js_url_list.length; i++){
//     js_url = js_url_list[i];
    
//     try{
//         let fileName = js_url.split('/').pop();
//         downloadDialog.content = '正在加载脚本' + i + "/" + js_url_list.length + ".....";
//         var x = http.get(js_url).body.string();
//         files.write('/sdcard/' + fileName, x);
//     }catch(e){
//         console.log(e);
//         console.error('脚本加载失败，已停止运行');
//         exit();
//     }
//     x = null;
// }

// downloadDialog.dismiss();
// engines.execScriptFile("/sdcard/UI.js");

engines.execScriptFile("UI.js");




   




