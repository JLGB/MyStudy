var ZSY = {};

importClass(android.database.sqlite.SQLiteDatabase);
importClass(java.net.HttpURLConnection);
importClass(java.net.URL);
importClass(java.io.File);
importClass(java.io.FileOutputStream);

// var tiku_url = 'https://git.yumenaka.net/https://raw.githubusercontent.com/Twelve-blog/Study_hamibot/main/question';
// var tiku_url = 'http://124.223.169.251:8897/resource/data/tiku';
// var miss_question_url = 'http://124.223.169.251:8897/study/missQuestion?question='


let ocr;
siren = true;
var delay_time = 1500;
var 乱序 = 'a';
var question_list = [];
var init_true = false;
var downloadDialog = null;
var file_tmp = false;
var tikus = '';
var download = null;
let 延迟时间 = 200;
var first = true;//记录答题的第一次


var chanlengeMinCount = 3; //挑战答题每轮答题数

var o = ['A.', 'B.', 'C.', 'D.', 'AAAA'];
var o1 = ['A', 'B', 'C', 'D', 'AAAA'];

//加载ocr插件
// get_ocr();

//截图授权
// requestScreenCaptureRight();

//初始化题库
init();


function requestScreenCaptureRight() {

    // 自动点击截图权限允许按钮
    threads.start(function () {
        if (auto.service != null) {  //如果已经获得无障碍权限
            //由于系统间同意授权的文本不同，采用正则表达式
            let Allow = textMatches(/(允许|立即开始|统一)/).findOne(10 * 1000);
            if (Allow) {
                Allow.click();
            }
        }
    });

    // 请求截图权限for OCR
    if (!requestScreenCapture(false)) {
        console.log("请求截图失败,脚本结束");
        exit();
    }
}


// ------------------------------       挑战答题            ------------------------------

ZSY.趣味答题 = function () {
    while (true) {
        sleep(1);
        if (text("开始比赛").exists()) {
            this.四人();
            break;
        }
        else if (text("时事政治").exists()) {
            this.挑战();
            break;
        }
        else if (text("随机匹配").exists()) {
            this.双人();
            break;
        }
    }
}


ZSY.挑战 = function () {
    news = false;
    challengeQuestion(); //挑战答题
    delay(0.5);
}

ZSY.OCR = function () {
    var img = captureScreen();
    var results = ocr.detect(img.getBitmap(), 1);
    for (var i = 0; i < results.size(); i++) {
        let obj = results.get(i);
        console.log(JSON.stringify(obj));
    }
    return results;
}



/**
 * @description: 双四人赛
 * @param: null
 * @return: null
 */
ZSY.四人 = function () {
    console.log("点击开始比赛")
    var s = text("开始比赛").findOne().click();
    return zsyAnswer();
}

ZSY.双人 = function () {
    // console.log("点击随机匹配")
    let clickableBtn = text("随机匹配").findOne().parent().child(0);
    click(clickableBtn.bounds().centerX(),clickableBtn.bounds().centerY());
    return zsyAnswer();
}



function zsyAnswer() {
    console.log("等待题目列表");
    className("ListView").waitFor();
    var range = className("ListView").findOnce().parent().bounds();
    var x = range.left + 20,
        dx = range.right - x - 20;
    var y = range.top,
        dy = device.height - 300 - y;
    console.log('坐标获取完成');

    while (!text('继续挑战').exists()) {
        delay(1);
        let radioButton = className('android.widget.RadioButton').depth(32).findOnce();
        if (radioButton) {
            radioButton.click();
        }
    }

    var x = 0;
    while (x > 0) {
        console.info('额外的 ' + x + ' 轮即将开始!');
        x--;
        delay(2);
        click('继续挑战');
        delay(3);
        if (text("随机匹配").exists()) {
            text("随机匹配").findOne().parent().child(0).click();
            console.log("点击随机匹配");
        } else {
            console.log("点击开始比赛");
            // my_click_clickable('开始比赛');
            var s = text("开始比赛").findOne(5000);
            if (s) {
                s.click();
            }
            else {
                console.log('没有找到开始比赛，点击随机匹配');
                text("随机匹配").findOne(3000).parent().child(0).click();
            }
        }
        delay(1);
        if (text('知道了').exists()) {
            console.warn('答题已满');
            text('知道了').findOnce().click();
            delay(1);
            return 0;
        }
        while (true) {
            if (text('继续挑战').exists()) break;
            while (!className('android.widget.RadioButton').depth(32).exists()) {
                delay(randomNum(3, 5));
                if (text('继续挑战').exists()) break;
            }
            delay(2);
            console.warn('随机点击');
            try {
                var t = className("ListView").findOne(5000).childCount();
                t = randomNum(0, t - 1);
                className('android.widget.RadioButton').depth(32).findOnce(t).click();
            }
            catch (e) { }
            if (text('继续挑战').exists()) break;
            sleep(200);
        }
        // console.warn('额外一轮结束!');
    }
    console.info('本局竞赛答题完成');
    delay(2);
    back();
    delay(2);
    back();
    delay(3);
    if (text('退出').exists()) {
        textContains('退出').click();
        delay(1);
    }
    return true;
}

function random_time(time) {
    return time + random(100, 1000);
}

/**
 * @description: 生成从minNum到maxNum的随机数
 * @param: minNum-较小的数
 * @param: maxNum-较大的数
 * @return: null
 */
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}


function click_ji_fen_to_do(itemName) {
    if (!text('登录').exists()) {
        back_to_home();
        id("comm_head_xuexi_score").findOne().click();
    }
    text('登录').waitFor();
    className("android.widget.ListView").findOnce().children().forEach(item => {
        let name = item.child(0).text();
        if (name == itemName) {
            item.child(4).click();
        }
    });
}


function questionShow() {
    while (!desc("工作").exists()) {
        console.log("等待加载出主页");
        delay(1);
        if (text("排行榜").exists()) {
            return;
        }
    }
    console.log("当前在主界面")
    if (text("我的").exists()) {
        text("我的").click();
        console.log("点击我的");
    }
    delay(1);
    while (!desc("我的信息").exists()) {
        console.log("等待 我的 界面");
        delay(1);
    }
    console.log("点击我要答题");
    text("我要答题").findOne().parent().click();
    delay(1);
}



function similarity_answer(op, ans) {
    var num = 0;
    for (var i = 0; i < ans.length; i++) {
        if (op.indexOf(ans[i]) != -1) num++;
    }
    for (var i = 0; i < ans.length - 1; i++) {
        if (op.indexOf(ans[i] + ans[i + 1]) != -1) num++;
    }
    for (var i = 0; i < ans.length - 2; i++) {
        if (op.indexOf(ans[i] + ans[i + 1] + ans[i + 2]) != -1) num++;
    }
    return num / (2 * op.length + 2 * ans.length);

    // log("op : " + op + "    ans: " + ans);

    // var num = 0;
    // if(op.length != ans.length){
    //     return 0;
    // }
    // for(var i = 0;i<ans.length;i++){
    //     if(op[i] == ans[i]) num++;
    // }
    // return num;

}

/**
 * 搜题
 * @param {*} question 题库问题
 * @param {*} answer  题库问题的答案
 * @param {*} q 搜索提问题
 * @param {*} flag 是否选项来搜索问题
 * @returns 
 */
function similarity(question, answer, q, flag) {
    // log("question:"  + question + "   answer:" + answer + "    q: " + q + "   flag: " + flag);
    var num = 0;
    var missCount = 0;
    var tmp = 1;

    if (flag) {
        question = answer;
    } else {
        if (q.length > 20) tmp = 2;
        if (q.length > 40) tmp = 3;
        if (q.length > 50) tmp = 4;
    }
    for (var i = 0; i < q.length - tmp; i += tmp) {
        if (question.indexOf(q[i] + q[i + 1]) != -1) {
            num++;
        } else {
            missCount++;
        }
    }

    if (num <= 3 && q.length > 10) {
        return 0;
    }

    if (missCount == 0) {
        return 999;
    } else {
        return num / (question.length + q.length);
    }
}



/*

function similarity(question,answer, q,flag) {
    var num = 0;
    if(flag){
        if(q.indexOf('十五日')!=-1 && question.indexOf('劳动行政部门自收到集体合同文本之日起')!=-1 && answer.split('\t')[0].indexOf('十日')!=-1){
            return 999;
        }
        if(q.indexOf('十五日')==-1 && q.indexOf('十日')!=-1 && question.indexOf('劳动行政部门自收到集体合同文本之日起')!=-1 && answer.split('\t')[0].indexOf('五日')!=-1){
            return 999;
        }
        if(question.indexOf('正确')==-1 && question.indexOf('下列不属于二十四史的')==-1){
            return 0;
        }
        for(var i = 0;i<q.length;i++){
          if(answer.indexOf(q[i])!=-1){
                num++;
          }
        }
        return num/(answer.length+q.length);
    }
    else{
        var errorCount = 0;
        var tmp = 1;
        if(q.length>20) tmp = 2;
        if(q.length>40) tmp = 3;
        if(q.length>50) tmp = 4;
        for(var i = 0;i<q.length-tmp;i+=tmp){
            if(question.indexOf(q[i]+q[i+1])!=-1){
                num++;
            }else{
                 errorCount ++;
                if(errorCount > 1){
                    return - 1;
                }
            }
        }
        if(errorCount == 0){
            return 999;
        }else{
            return num/(question.length+q.length);
        }
    }
}

*/

// 延迟
function delay(seconds) {
    sleep(1000 * seconds + random(100, 300));
}


/**
 * @description: 加载题库和加载替换
 * @param: null
 * @return: null
 */
function init() {
    // if(init_true) return;

    // console.info('正在加载题库中.....');
    // downloadDialog = dialogs.build({
    //     title: "正在加载题库...",
    //     progress: {
    //       max: 100,
    //       showMinMax: true
    //     },
    //     autoDismiss: false,
    //     cancelable: true
    // }).show();
    try {
        startDownload();
        // delay(2);
        // download.join(1000*60);
        // if(!file_tmp){
        //     download.interrupt();
        //     console.error('题库加载超时！，再次加载一次');
        //     startDownload();
        // }
        // while(!file_tmp){
        //     console.log('等待加载题库!!!');
        //     delay(2);
        // }
        // file_tmp = null;
        tikus = tikus.split('\n');
        for (var i = 0; i < tikus.length; i++) {
            var t = tikus[i].split(' ');
            if (t[1] && t[0]) {
                var answer = '';
                for (var j = 2; j < t.length; j++) {      // 可能tiku答案有空格，但是被切割了
                    answer += t[j];
                }
                question_list.push([t[1], t[0], answer]);
            }
        }
        answer = null;
        tikus = null;
        init_true = true;
        if (question_list.length < 1000) {
            console.info('题库崩了！！！，等！！！');
            exit();
        }
    }
    catch (e) {
        console.error('题库获取失败，检查网络连接！！！');
        exit();
    }
}


function startDownload() {

    tikus = files.read("tiku")

    // download = threads.start(function () {
    //     console.log('等待加载题库!!!');
    //     let is = null;
    //     try{
    //         var conn = new URL(tiku_url).openConnection();
    //         conn.connect();
    //         is = conn.getInputStream();
    //         let count = 0;
    //         length = 973328;
    //         let buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
    //         while (true) {
    //             var p = Math.abs(Math.min(((count / length) * 100),100));
    //             let numread = is.read(buffer);
    //             count += numread;
    //             if (numread < 0) {
    //                 toast("加载完成");
    //                 console.info("加载完成");
    //                 downloadDialog.dismiss();
    //                 downloadDialog = null;
    //                 break;
    //             }
    //             downloadDialog.setProgress(p);
    //             tikus+=java.lang.String(buffer,"UTF-8").slice(0,numread);
    //         }
    //         is.close();
    //         file_tmp = true;
    //     }catch(e){
    //         console.error(e);
    //         console.warn('题库加载失败');
    //         question_list = null;
    //         if(is){
    //             is.close();
    //         }

    //         tikus = null;
    //         exit();
    //     }
    // })

}


let ocrDownloadDialog;
function get_ocr() {
    // console.info("正在启动OCR插件");
    // try {
    //     ocr = plugins.load("com.hraps.ocr");
    // } catch (e) {
    //     console.hide();
    //     ocrDownloadDialog = dialogs.build({
    //         content: "双/四人挑战 或 挑战答题 请先安装OCR插件\n下载链接：http://124.223.169.251:8897/resource/apk/Ocr-AjPlugin-32位.apk",
    //         title:"未检测到OCR插件",
    //         autoDismiss: false,
    //         cancelable: true,
    //         positive:"立即下载",
    //         negative:"放弃答题"
    //     }).on("positive",downloadOcr).on("negative",negativeOcr).show();
    //     exit();
    // }
}

function downloadOcr() {
    app.openUrl('http://124.223.169.251:8897/resource/apk/Ocr-AjPlugin-32位.apk');
    ocrDownloadDialog.dismiss();
}

function negativeOcr() {
    ocrDownloadDialog.dismiss();
}






/**
 * @description: 挑战答题
 * @param: null
 * @return: null
 */
function challengeQuestion() {

    text("时事政治").findOne().click();
    delay(1);

    let rightNum = 0; //连续答对的次数
    while (true) {
        delay(2);
        if (!className("RadioButton").exists()) {
            if(text("立即复活").exists()){
                text("立即复活").click();
            }else if(text("再来一局").exists()){
                text("再来一局").click();
            }
            console.error("没有找到题目！请检查是否进入答题界面！");
            continue;
        }
        challengeQuestionLoop(rightNum);
        delay(2);
        if(text("立即复活").exists()){
            if (rightNum < chanlengeMinCount){
                text("立即复活").click();
                delay(3)
            }else{
                text("结束本局").click();
                delay(1.5)
                back_to_home()
                break;
            }
        }else if(text("再来一局").exists()){
            back_to_home()
            break;
        }else{
            rightNum++;
        }
    }

}


// 返回主页
function back_to_home() {
    while (!(id("home_bottom_tab_button_work").exists() || text("百灵").exists())) {
        back();
        delay(1.5 * DEFAULT_DELAY);
        check_current_package();
    }
}


/**
 * @description: 每次答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    let ClickAnswer; //定义已点击答案
    if (conNum >= chanlengeMinCount) //答题次数足够退出，每轮qCount=5+随机1-3次
    {
        let listArray = className("ListView").findOnce().children(); //题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("本轮答题数足够，随机点击答案");
        var question = className("ListView").findOnce().parent().child(0).text();
        question = question.replace(/\s/g, "");
        var options = []; //选项列表
        if (className("ListView").exists()) {
            className("ListView").findOne().children().forEach(child => {
                var answer_q = child.child(0).child(1).text();
                options.push(answer_q);
            });
        } else {
            console.error("答案获取失败!");
            return;
        } //20201217添加 极低概率下，答题数足够，下一题随机点击，碰到字形题
        if (question == "选择正确的读音" || question == "选择词语的正确词形" || question == "下列词形正确的是") {
            // 选择第一个
            console.log((conNum + 1).toString() + ".直接选第一个!!!");
            className('android.widget.RadioButton').depth(28).findOne().click();
            return;
        }
        console.log((conNum + 1).toString() + ".随机点击题目：" + question);
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();; //记录已点击答案
        console.log("随机点击:" + ClickAnswer);
        //如果随机点击答案正确，则更新到本地题库tiku表
        delay(0.5); //等待0.5秒，是否出现X
        console.log("---------------------------");
        return;
    }
    if (className("ListView").exists()) {
        var question = className("ListView").findOnce().parent().child(0).text();
    } else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children(); //题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击");
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        return;
    }
    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }
    //question = question.replace(/\s/g, "");
    var options = []; //选项列表
    if (className("ListView").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    } else {
        console.error("答案获取失败!");
        return;
    }
    var reg = /.*择词语的正确.*/g;
    var rea = /.*择正确的读音.*/g;
    var reb = /.*不属于二十四史的是.*/g;
    if (reg.test(question) || rea.test(question) || reb.test(question)) { // 选择第一个
        console.log((conNum + 1).toString() + ".直接选第一个!!!");
        className('android.widget.RadioButton').depth(28).findOne().click();
        return;
    }
    console.log((conNum + 1).toString() + ".题目：" + question);
    var answer = getAnswer(question);
    console.info("答案：" + answer);
    if (/^[a-zA-Z]{1}$/.test(answer)) { //如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        console.log(answer);
    }
    let hasClicked = false;
    let listArray = className("ListView").findOnce().children(); //题目选项列表
    if (answer == "") //如果没找到答案
    {
        let i = random(0, listArray.length - 1);
        console.error("没有找到答案，随机点击");
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();; //记录已点击答案
        hasClicked = true;
        console.log("随机点击:" + ClickAnswer); //如果随机点击答案正确，则更新到本地题库tiku表
        delay(0.5); //等待0.5秒，是否出现X
        console.log("---------------------------");
    } else //如果找到了答案
    {
        listArray.forEach(item => {
            var listDescStr;
            try {
                let child1 = item.child(0);
                let child2 = child1.child(1)
                listDescStr = child2.text();
            } catch (e) {
                console.error("item:" + item);
                console.error(e);
            }

            if (listDescStr == answer) {
                delay(random(0.5, 1)); //随机延时0.5-1秒
                try {
                    item.child(0).click(); //点击答案
                    hasClicked = true;
                }
                catch (e) { }
                delay(0.5); //等待0.5秒，是否出现X
                if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                    "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
                {
                    // console.log("题库答案正确……");
                }
                if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
                    "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
                {
                    console.error("答案错误!!!");
                    /*checkAndUpdate(question, answer, ClickAnswer);*/
                }
                console.log("---------------------------");
            }
        });
    }
    if (!hasClicked) //如果没有点击成功
    { //因导致不能成功点击问题较多，故该部分不更新题库，大部分问题是题库题目适配为填空题或多选题或错误选项
        console.error("未能成功点击，随机点击");
        let i = random(0, listArray.length - 1);
        delay(random(0.5, 1)); //随机延时0.5-1秒
        listArray[i].child(0).click(); //随意点击一个答案
        console.log("随机点击:" + ClickAnswer);
        delay(0.5); //等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.log("随机点击正确……");
        }
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists() || text("再来一局").exists()) //遇到❌号，则答错了,不再通过结束本局字样判断
        {
            console.error("随机点击错误!!!");
            /*checkAndUpdate(question, answer, ClickAnswer);*/
        }
        console.log("---------------------------");
    }
}

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question) {
    var question1 = question.split('来源：')[0]; //去除来源
    question1 = question1.replace(/ /g, '');//再删除多余空格
    question1 = question1.replace(/  /g, '');
    try {
        var option = '';
        var similars = 0;
        var pos = -1;
        for (var i = 0; i < question_list.length; i++) {
            var s = similarity(question_list[i][0], '', question1, 0);
            if (s > similars) {
                similars = s;
                pos = i;
            }
        }
        option = question_list[pos][1];
        var ans = question_list[pos][2].split('	')[option[0].charCodeAt(0) - 65];
        if (!ans) return 'A';
        return ans;
        // return option;
    } catch (e) {
        return "A";
    }
}


module.exports = ZSY;