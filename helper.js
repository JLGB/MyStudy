
device.keepScreenDim(); // 保持屏幕常亮

auto.waitFor();



var CONFIG = storages.create("CONFIG");
var PACKAGE_NAME = "cn.xuexi.android";
var my_scores = {}; // 已学习积分
var radio_on = 0; // 电台状态
var articles_to_learn = 0; // 剩余文章数

var DEFAULT_DELAY = 1.5;
var nickname = '';

var app_allow_screenshot = true;

// console.info("欢迎使用强国助手！\n项目地址：https://github.com/sec-an/Better-Auto-XXQG")
console.log("默认延迟:" + DEFAULT_DELAY + "秒");
// console.log("OCR延迟:" + OCR_DELAY + "毫秒");

console.log("正在打开学习强国...");
app.launch(PACKAGE_NAME);

// console.setPosition(0, device.height / 1.5);
// if (CONFIG.get("SHOW_CONSOLE_CHECK", false)) {
//     console.show();
// }
console.info("若程序无反应，请重启好好学习app，重新授权无障碍权限");

id('comm_head_title').findOne(5500);

//获取积分
get_scores();


let articles_title_map = storages.create("articles_title1_key");
do_other();

device.cancelKeepingAwake(); // 取消屏幕常亮
console.info("答题结束，等待10秒后关闭");
delay(10);
console.hide();


function click_ji_fen_to_do(itemName) {
    if (!text('我要选读文章').exists()) {
        back_to_home();
        id("comm_head_xuexi_score").findOne().click();
        delay(2)
    }
    console.log("点击答题： " + itemName + "  " + text(itemName).findOne(3000).parent().child(4).text())
    text(itemName).findOne(3000).parent().child(4).click();
    delay(2)
    console.log("积分点击完成");
}


//
function do_other() {
    // let person_4_answer_flag = CONFIG.get("4_PERSON_ANSER_CHECK", true) && app_allow_screenshot;
    // let person_2_answer_flag = CONFIG.get("2_PERSON_ANSER_CHECK", true) && app_allow_screenshot;
    let tiao_zhan_answer_flag = CONFIG.get("TIAO_ZHAN_ANSER_CHECK", true);
    let day_answer_flag = CONFIG.get("DAY_ANSER_CHECK", true);
    let tv_flag = CONFIG.get("VIDEO_CHECK", true);
    let wen_zhang_guang_bo_flag = CONFIG.get("WEN_ZHANG_GUANG_BO_CHECK", true);
    //分享1次
    var cnt = 1;

    while (
        (my_scores['我要选读文章'] != 12 && wen_zhang_guang_bo_flag)
        || (my_scores['我要视听学习'] != 12 && tv_flag)
        || (my_scores['每日答题'] != 5 && day_answer_flag)
        || (my_scores['趣味答题'] < 8 && tiao_zhan_answer_flag)
        || my_scores['发表观点'] != 1
        || my_scores['本地频道'] != 1) {

        // 每日答题
        if (my_scores['每日答题'] != 5 && day_answer_flag) {
            console.info("准备进行每日答题...");
            click_ji_fen_to_do('每日答题');
            text('查看提示').findOnce(5000);
            while (true) {
                exam_practise();
                if (text("再来一组").exists()) {
                    delay(2);
                    if (!text("领取奖励已达今日上限").exists()) {
                        my_click("再来一组");
                        console.log("再来一组");
                        delay(DEFAULT_DELAY);
                    } else {
                        console.log("每日答题结束,返回主页...")
                        // back_to_home();
                        break;
                    }
                }
            }
        }

        // 趣味答题
        if (my_scores['趣味答题'] < 8 && tiao_zhan_answer_flag) {
            click_ji_fen_to_do('趣味答题');
            console.log("准备趣味答题...");
            get_zsy().趣味答题();
            back_to_home()
        }

        //获取频道
        var region = "";
        back_to_home();
        if (id("home_bottom_tab_button_work").exists()) {
            id("home_bottom_tab_button_work").findOnce().click(); // "学习"页
        } else if (text("工作").exists()) {
            my_click("工作");
        } else {
            check_current_package();
            console.log("请点击学习强国主页\n'学习'按钮!!!");
            //device.vibrate(500);
            text("播报").waitFor();
        }
        delay(1.5);
        let 地方频道;
        let 综合频道;
        if (className("android.widget.TextView").text("综合").exists()) {
            var itemList = className("android.widget.TextView").text("综合").findOne().parent().parent();
            for (var i = 0; i < itemList.childCount(); i++) {
                if (itemList.child(i).child(0).text() == '综合') {
                    地方频道 = itemList.child(i - 1);
                    综合频道 = itemList.child(i);
                    break;
                }
            }
        } else {
            check_current_package();
            console.log("请点击学习强国主页\n'思想'和'综合'中间的地方频道!!!");
            //device.vibrate(500);
            text("切换地区").waitFor();
        }

        // 本地频道1分
        if (my_scores['本地频道'] != 1) {
            console.info("准备完成本地频道任务...");
            if (地方频道) {
                delay(1);
                地方频道.click(); // 地方频道
                console.log('点击地方频道: ' + 地方频道.child(0).text());
                className("androidx.recyclerview.widget.RecyclerView").findOne().child(2).click();
                delay(2);
            } else {
                check_current_package();
                console.log("请点击学习强国主页\n'思想'和'综合'中间的地方频道!!!");
                //device.vibrate(500);
                text(region).waitFor();
            }
            back_to_home();
        }


        // 发表观点
        if (my_scores['发表观点'] != 1) {
            console.info("准备发表观点...");
            if (id("home_bottom_tab_button_work").exists()) {
                id("home_bottom_tab_button_work").findOnce().click(); // "学习"键刷新文章列表
            } else if (text("工作").exists()) {
                my_click("工作");
            } else {
                check_current_package();
                console.log("请点击学习强国主页学习按钮!!!");
                //device.vibrate(500);
                text("播报").waitFor();
            }
            delay(DEFAULT_DELAY);
            if (className("android.widget.TextView").text("综合").exists()) {
                综合频道.click() // 综合频道
                console.log("进入综合栏目");
            } else {
                check_current_package();
                console.log("请点击学习强国主页\n'综合'频道!!!");
                //device.vibrate(500);
                text("播报").waitFor();
            }
            let speechs = ["好好学习，天天向上,为中国崛起而奋斗", "大国领袖，高瞻远瞩", "请党放心，强国有我，拥护中国共产党", "坚持信念，砥砺奋进，再创辉煌", "团结一致，共建美好，共创未来", "歌颂共产党,永远跟党走。", "为中华崛起而读书！", "倡导富强、民主、文明、和谐", "自由，平等，公正，法治", "不忘初心，牢记使命", "努力奋斗，回报祖国！", "赞叹中共伟大成就 祝福中国美好未来！"];
            delay(2 * DEFAULT_DELAY);

            if (!text('播报').exists()) {
                let h = device.height; // 屏幕高
                let w = device.width; // 屏幕宽
                let x = (w / 6) * 5; // 横坐标5/6
                let h1 = (h / 6) * 5; // 纵坐标5/6
                let h2 = (h / 6); // 纵坐标1/6
                swipe(x, h1, x, h2, 500); // 下滑（纵坐标从5/6处滑到1/6处）
                delay(DEFAULT_DELAY);
            }

            if (text('播报').exists()) {
                let bobao_parent_item = text('播报').findOnce().parent();
                while (!bobao_parent_item.clickable()) {
                    bobao_parent_item = bobao_parent_item.parent();
                }
                bobao_parent_item.click();
                console.log("进入文章页面");
            } else {
                //device.vibrate(500);
                check_current_package();
                console.log("请选择任意文章进入评论");
            }

            while (1) {
                delay(2);
                if (textContains('欢迎发表你的观点').exists()) {
                    // my_click('欢迎发表你的观点');
                    // console.log("点击评论框");
                    console.log("点击评论框");
                    // textContains('欢迎发表你的观点').findOne().click();
                    click('欢迎发表你的观点')
                    delay(2);
                    break;
                } else {
                    check_current_package();
                    console.log("请点击评论框!!!");

                    //device.vibrate(500);
                    text('好观点将会被优先展示').waitFor();
                }
            }

            console.log("填写评论内容");
            setText(speechs[random(0, speechs.length - 1)]);
            delay(1.5 * DEFAULT_DELAY);
            click("发布");
            console.log("发布评论");
            delay(1.5 * DEFAULT_DELAY);
            click('删除');
            console.log("删除评论");
            delay(1.5 * DEFAULT_DELAY);
            click('确认');
            back_to_home();
        }

        // 打开电台广播 
        media.pauseMusic(); // 暂停音乐播放
        if (my_scores['我要视听学习'] < 12 && wen_zhang_guang_bo_flag) {
            back_to_home();
            console.log("准备收听广播");
            if (id("home_bottom_tab_button_mine").exists()) {
                id("home_bottom_tab_button_mine").findOnce().click();
            } else if (text("电台").exists()) {
                my_click("电台");
            } else {
                check_current_package();
                console.log("请点击学习强国主页\n右下方'电台'按钮!!!");
                //device.vibrate(500);
                text("听同期声").waitFor();
            }
            delay(DEFAULT_DELAY);
            if (text("听广播").exists()) my_click("听广播");
            else {
                check_current_package();
                console.log("请点击'听广播'栏目!!!");
                //device.vibrate(500);
                text("国家广播电台").waitFor();
            }
            delay(DEFAULT_DELAY);
            if (id("v_paused").exists()) id("v_paused").findOne(5000).click(); // 播放按钮
            else {
                check_current_package();
                console.log("请点击播放按钮▶!!!");
                //device.vibrate(500);
                id("v_playing").waitFor();
            }
            console.log("开始收听广播...");
            radio_on = 1;
            back_to_home();
        }


        // 选读文章12分
        while (articles_to_learn && wen_zhang_guang_bo_flag) {
            back_to_home();
            console.log("准备选读文章...");
            if (id("home_bottom_tab_button_work").exists()) {
                id("home_bottom_tab_button_work").findOnce().click(); // "学习"键刷新文章列表
            }
            if (className("android.widget.TextView").text("要闻").exists()) {
                综合频道.click(); // 综合
            } else {
                check_current_package();
                console.log("请点击学习强国主页\n'综合'频道!!!");
                //device.vibrate(500);

            }
            let scroll_down = 10;
            let h = device.height; // 屏幕高
            let w = device.width; // 屏幕宽
            let x = (w / 6) * 5; // 横坐标5/6
            let h1 = (h / 6) * 5; // 纵坐标5/6
            let h2 = (h / 6); // 纵坐标1/6


            while (scroll_down) {
                delay(DEFAULT_DELAY);
                let temp_current_page_articles = id('general_card_title_id').find();
                var current_page_articles = [];
                for (var i = 0; i < temp_current_page_articles.length; i++) {
                    let title = temp_current_page_articles[i].text();

                    if (!articles_title_map.get(title)) {
                        current_page_articles.push(temp_current_page_articles[i]);
                    }
                }

                if (current_page_articles.length) {
                    log("当前页找到" + current_page_articles.length + "篇文章");
                    break;
                }
                console.log("下滑寻找可读文章...");
                swipe(x, h1, x, h2, 500); // 下滑（纵坐标从5/6处滑到1/6处）
                scroll_down--;
            }

            for (var i = 0; i < current_page_articles.length; i++) {
                if (!articles_to_learn) break;
                console.log("准备阅读下一篇文章...");
                delay(DEFAULT_DELAY);
                try {
                    check_current_package();
                    console.log("点击进入文章页面");
                    let parent_item = current_page_articles[i].parent();
                    while (!parent_item.clickable()) {
                        parent_item = parent_item.parent();
                    }
                    parent_item.click();
                    articles_title_map.put(current_page_articles[i].text(), true);
                } catch (error) {
                    continue;
                }
                delay(3 * DEFAULT_DELAY);
                console.log("等待文章加载...");
                className("android.widget.ImageView").waitFor();
                if (!id('BOTTOM_LAYER_VIEW_ID').exists()) {
                    console.error("非文章,退出并重新选择文章...");
                    back_to_home();
                    continue;
                }
                swipe(x, h1, x, h2, 500);
                let seconds = 60 + random(0, 5);
                for (var j = 0; j < seconds; j++) {
                    sleep(1000);
                    if (j % 5 == 0) {
                        console.log("剩余" + (seconds - j - 1) + "秒");
                        if (j <= seconds / 2) { // 每10秒滑动一次，如果android版本<7.0请将此滑动代码删除
                            swipe(x, h1, x, h2, 500); // 向下滑动
                        } else {
                            swipe(x, h2, x, h1, 500); // 向上滑动
                        }
                    }
                }
                articles_to_learn--;
                console.log("剩余" + articles_to_learn + "篇文章待学...");
                back_to_home();
            }
            get_scores();
        }

        // 关闭电台广播
        if (radio_on) {
            console.info("准备关闭电台广播...");
            back_to_home();
            if (id("home_bottom_tab_button_mine").exists()) {
                id("home_bottom_tab_button_mine").findOnce().click();
            } else if (text("电台").exists()) {
                my_click("电台");
            } else {
                check_current_package();
                console.log("请点击学习强国主页\n右下方'电台'按钮!!!");
                //device.vibrate(500);
                text("强国之声").waitFor();
            }
            delay(DEFAULT_DELAY);
            if (text("听广播").exists()) my_click("听广播");
            else {
                check_current_package();
                console.log("请点击'听广播'栏目!!!");
                //device.vibrate(500);
                text("国家广播电台").waitFor();
            }
            // 暂停按钮
            delay(4);
            if (id("v_playing").exists()) {
                id("v_playing").findOnce().click();
            }
            else {
                check_current_package();
                console.log("请点击暂停按钮!!!");
                //device.vibrate(500);
                id("v_paused").waitFor();
            }
            console.log("电台广播已关闭");
        }

        if (wen_zhang_guang_bo_flag) {
            media.resumeMusic();
        }


        // 我要视听学习6分
        var tv_to_watch = 12 - my_scores['我要视听学习']; // 剩余视频数
        if (tv_to_watch > 6) {
            tv_to_watch = 6;
        }
        while (tv_to_watch && tv_flag) {
            console.info("准备进行我要视听学习任务...");
            back_to_home();

            console.log("准备进入'百灵'页");
            if (id("home_bottom_tab_button_ding").exists()) {
                id("home_bottom_tab_button_ding").findOnce().click(); // "百灵"页
            } else if (text("百灵").exists()) {
                my_click("百灵");
            } else {
                check_current_package();
                console.log("请点击学习强国主页\n最下方'百灵'栏目!!!");
                //device.vibrate(500);
                text("竖").waitFor();
            }

            let tvItemNameList = ['党史', '竖', '炫', '窗', '藏', '靓', '推荐'];
            let tv_tab_idx = CONFIG.get("VIDEO_IDX", 6);
            let tvItemName = tvItemNameList[tv_tab_idx % tvItemNameList.length];
            console.log("准备进入 " + tvItemName + " 分栏");
            if (text("竖").exists()) {
                my_click(tvItemName);
            } else {
                check_current_package();
                console.log("请点击'百灵'主页\n上方 " + tvItemName + " 栏目!!!");
                //device.vibrate(500);
                sleep(5000);
                text("").waitFor();
            }
            tv_tab_idx++;
            CONFIG.put("VIDEO_IDX", tv_tab_idx);

            delay(3);

            let h = device.height; // 屏幕高
            let w = device.width; // 屏幕宽
            let x = (w / 6) * 4; // 横坐标4/6
            let h1 = (h / 6) * 5; // 纵坐标5/6
            let h2 = (h / 6); // 纵坐标1/6

            try {
                className("android.widget.ListView").depth(21).findOnce().child(1).child(1).child(0).child(0).click();
            } catch (e) {
                console.error('点击视频失败：' + e);
                back_to_home();
                break;
            }


            delay(DEFAULT_DELAY);
            if (text('继续播放').exists()) my_click('继续播放');
            if (text('刷新重试').exists()) my_click('刷新重试');

            console.log("需要观看视频数量：" + tv_to_watch);
            let tv_index = 0;
            while (tv_to_watch > 0) {
                try {
                    var total_video_time_text = textContains(" / ").findOne().text();
                    var current_video_time = total_video_time_text.slice(- 5);
                    console.log("视频时长：" + current_video_time)
                    var tv_minutes = parseInt(current_video_time.slice(0, 2));
                    var tv_seconds = parseInt(current_video_time.slice(3))
                    var tv_has_watched_seconds = parseInt(total_video_time_text.slice(3, 5))
                    if (tv_minutes + tv_seconds === 0) {
                        console.log("获取视频时长失败，1秒后再次获取");
                        delay(1);
                        continue;
                    }

                    let title = className('android.widget.TextView').clickable(true).depth(15).findOne().text();
                    className('android.widget.LinearLayout').clickable(true).depth(16).waitFor();
                    // 视频超过一分钟 或者 已经浏览过该视频 跳过 
                    tv_index++;
                    if (tv_index > 10) {
                        console.info(tvItemName + " 没有新的视频了，退出观看");
                        break;
                    }

                    var hasWatchedTv = articles_title_map.get(title);
                    if ((hasWatchedTv && tv_index > 5) || tv_minutes >= 1) {
                        if (hasWatchedTv) {
                            console.info(title + " 已经阅读过了，跳过")
                        } else if (tv_minutes >= 1) {
                            console.info(title + " 视频时间超过一分钟，跳过")
                        }

                        swipe(x, h1, x, h2, 500); //下一个视频
                        delay(DEFAULT_DELAY);
                        continue;
                    }

                    sleep((tv_minutes * 60 + tv_seconds - tv_has_watched_seconds) * 1000);
                    articles_title_map.put(title, true);
                    tv_to_watch--;
                    addTodayWatchedTvNum(1);
                    if (tv_to_watch > 0) {
                        console.log("剩余" + (tv_to_watch) + "个视频待观看");
                    } else {
                        console.info("视频观看完成");
                    }
                } catch (error) {
                    console.log(error);
                    sleep(3000); // 如果被"即将播放"将读取不到视频的时间长度，此时就sleep 3秒
                    swipe(x, h1, x, h2, 500); //下一个视频

                }
            }

            get_scores();
        }

        get_scores();
    }
}

let ZSY;
function get_zsy() {
    // let person_4_answer_flag = CONFIG.get("4_PERSON_ANSER_CHECK", true);
    // let person_2_answer_flag = CONFIG.get("2_PERSON_ANSER_CHECK", true);
    let tiao_zhan_answer_flag = CONFIG.get("TIAO_ZHAN_ANSER_CHECK", true);
    if (!ZSY) {
        // ZSY = require("zsy.js");
        ZSY = require("/sdcard/zsy.js");
    }
    return ZSY;
}

// 延迟
function delay(seconds) {
    sleep(1000 * seconds);
}

// 返回主页
function back_to_home() {
    while (!(id("home_bottom_tab_button_work").exists() || text("百灵").exists())) {
        back();
        delay(1.5 * DEFAULT_DELAY);
        check_current_package();
    }
}

// 检查当前应用
function check_current_package() {
    if (currentPackage() != PACKAGE_NAME) {
        //device.vibrate(500);
        // console.log("好好学习APP： 请回到学习强国页面!!!");

        // console.log("15s后自动回到学习强国...");
        // delay(5);
        // app.launch(PACKAGE_NAME);
        // delay(DEFAULT_DELAY);
    }
}

// 点击文字对象
function my_click(target) {
    // text(target).waitFor();
    // click(target);
    // text(target).click

    if (click(target)) {
        console.log("点击：" + target);
    } else {
        console.log("点击：" + target + "  失败");
    }
    delay(2);
    // console.log("点击结束");
}


function checkSlider() {
    let hasSlider = false;
    // while (textContains("访问异常").exists()) {
    //     hasSlider = true;
    //     // toast("等待手动完成滑块验证");
    //     try {
    //         let slider = idContains("nc_1_n1t").findOnce();
    //         let sliderPath = idContains("nc_1-stage-1").findOnce();
    //         if (!sliderPath) {
    //             continue;
    //         }
    //         let x1 = slider.bounds().right - 15;
    //         let y1 = slider.bounds().centerY() + 20;
    //         let x2 = sliderPath.bounds().right - 30;
    //         let y2 = y1 - 30;
    //         randomSwipe(x1, y1, x2, y2);

    //         delay(1.5);

    //         if (textContains("访问异常").exists()) {
    //             let refresh = className("android.widget.Image").text("icon/24/icon_Y_shuaxin").findOnce().parent();
    //             // log("刷新坐标：" + refresh.bounds());
    //             refresh.click();
    //             delay(1.5);
    //         }

    //     } catch (e) {
    //         log(e);
    //         console.log("滑块异常，请手动完成滑块");
    //     }

    // }

    // while (id("content").exists()) {
    //     hasSlider = true;
    //     console.warn("请手动完成滑块验证");
    //     delay(3);

    // }
    return hasSlider;
}



/**
 * 真人模拟滑动函数
 * 
 * 传入值：起点终点坐标
 * 效果：模拟真人滑动
 */
function randomSwipe(sx, sy, ex, ey) {
    //设置随机滑动时长范围
    var timeMin = 500
    var timeMax = 1500
    //设置控制点极限距离
    var leaveHeightLength = 500

    //根据偏差距离，应用不同的随机方式
    if (Math.abs(ex - sx) > Math.abs(ey - sy)) {
        var my = (sy + ey) / 2
        var y2 = my + random(0, leaveHeightLength)
        var y3 = my - random(0, leaveHeightLength)

        var lx = (sx - ex) / 3
        if (lx < 0) { lx = -lx }
        var x2 = sx + lx / 2 + random(0, lx)
        var x3 = sx + lx + lx / 2 + random(0, lx)
    } else {
        var mx = (sx + ex) / 2
        var y2 = mx + random(0, leaveHeightLength)
        var y3 = mx - random(0, leaveHeightLength)

        var ly = (sy - ey) / 3
        if (ly < 0) { ly = -ly }
        var y2 = sy + ly / 2 + random(0, ly)
        var y3 = sy + ly + ly / 2 + random(0, ly)
    }

    //获取运行轨迹，及参数
    var time = [0, random(timeMin, timeMax)]
    var track = bezierCreate(sx, sy, x2, y2, x3, y3, ex, ey)

    //滑动
    gestures(time.concat(track))
}


function bezierCreate(x1, y1, x2, y2, x3, y3, x4, y4) {
    //构建参数
    var h = 100;
    var cp = [{ x: x1, y: y1 + h }, { x: x2, y: y2 + h }, { x: x3, y: y3 + h }, { x: x4, y: y4 + h }];
    var numberOfPoints = 100;
    var curve = [];
    var dt = 1.0 / (numberOfPoints - 1);

    //计算轨迹
    for (var i = 0; i < numberOfPoints; i++) {
        var ax, bx, cx;
        var ay, by, cy;
        var tSquared, tCubed;
        var result_x, result_y;

        cx = 3.0 * (cp[1].x - cp[0].x);
        bx = 3.0 * (cp[2].x - cp[1].x) - cx;
        ax = cp[3].x - cp[0].x - cx - bx;
        cy = 3.0 * (cp[1].y - cp[0].y);
        by = 3.0 * (cp[2].y - cp[1].y) - cy;
        ay = cp[3].y - cp[0].y - cy - by;

        var t = dt * i
        tSquared = t * t;
        tCubed = tSquared * t;
        result_x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
        result_y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;
        curve[i] = {
            x: result_x,
            y: result_y
        };
    }

    //轨迹转路数组
    var array = [];
    for (var i = 0; i < curve.length; i++) {
        try {
            var j = (i < 100) ? i : (199 - i);
            xx = parseInt(curve[j].x)
            yy = parseInt(Math.abs(100 - curve[j].y))
        } catch (e) {
            break
        }
        array.push([xx, yy])
    }

    return array
}



// 获取当日积分
function get_scores() {
    if (!text('积分规则').exists()) {
        //返回首页
        back_to_home();

        //回到学习页面
        if (id("home_bottom_tab_button_work").exists()) {
            id("home_bottom_tab_button_work").findOnce().click(); // "学习"页
        }

        console.log("准备获取当日积分...");
        let jifen = id("comm_head_xuexi_score").findOne(5000);
        if (jifen) {
            jifen.click();
            console.log("点击‘积分’");
        }
    }

    while (true) {
        if (textContains("我要选读文章").findOnce()) {
            break;
        } else {
            delay(1);
            console.log("等待积分刷新...");
        }

    }

    let err = false;
    while (!err) {
        try {
            console.log("读取积分列表")
            className("android.widget.ListView").findOne().children().forEach(item => {
                let name = item.child(0).text();
                let score = item.child(3).child(0).text();
                my_scores[name] = score;

            });
            err = true;
        } catch (e) {
            delay(5)
            console.log('积分获取异常：' + e);
        }
    }
    articles_to_learn = Math.ceil((12 - my_scores["我要选读文章"]) / 2);
}


function exam_practise() {
    let ZiXingTi = "选择词语的正确词形。"; // 字形题
    let DuYinTi = "选择正确的读音。"; // 读音题 20201211
    let ErShiSiShi = "下列不属于二十四史的是。"; // 二十四史
    let blankArray = [];
    let question = "";
    let answer = "";
    try {
        if (textStartsWith("填空题").exists()) {
            var questionArray = getFitbQuestion();
            questionArray.forEach(item => {
                if (item != null && item.charAt(0) == "|") { // 空格数
                    blankArray.push(item.substring(1));
                } else { // 题目段
                    question += item;
                }
            });
            question = question.replace(/\s/g, "");
            console.log("题目：" + question);
            var tipsStr = getTipsStr();
            answer = getAnswerFromTips(questionArray, tipsStr);
            if (answer.length) {
                console.info("提示答案：" + answer);
            } else {
                answer = "拥护中国共产党";
                console.info("没有找到答案，默认填写 “拥护中国共产党“");
            }

            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
        } else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
            var questionArray = getChoiceQuestion();
            questionArray.forEach(item => {
                if (item != null && item.charAt(0) == "|") { // 空格数
                    blankArray.push(item.substring(1));
                } else { // 题目段
                    question += item;
                }
            });
            var options = []; // 选项列表
            if (className("ListView").exists()) { // 选择题提取答案，为字形题 注音题准备
                className("ListView").findOne().children().forEach(child => {
                    var answer_q = child.child(0).child(2).text(); // 此处child(2)为去除选项A.的选项内容
                    options.push(answer_q);
                });
            } else {
                console.error("答案获取失败,请手动处理!");
                //device.vibrate(500);
                delay(2 * DEFAULT_DELAY);
                return;
            }
            question = question.replace(/\s/g, "");
            if (question == ZiXingTi.replace(/\s/g, "") || question == DuYinTi.replace(/\s/g, "") || question == ErShiSiShi.replace(/\s/g, "")) {
                question = question + options[0]; // 字形题 读音题 在题目后面添加第一选项                
            }
            console.log("题目：" + question);
            var tipsStr = getTipsStr();
            answer = clickByTips(tipsStr);
            console.info("提示答案：" + answer);
        }

        for (var i = 0; i < 5; i++) {
            delay(1)
            if (text("确定").exists()) { // 每日、每周答题
                my_click("确定");
                if (text("下一题").exists()) { // 每日答题做错，先确定，再下一题
                    my_click("下一题");
                }
                if (text("完成").exists()) { // 每日答题最后一题做错后的提交
                    my_click("完成");
                }
                break;
            } else if (text("下一题").exists()) { // 专项答题
                my_click("下一题");
                break;
            } else if (text("完成").exists()) { // 专项答题最后一题
                my_click("完成");
                break;
            } else {
                console.warn("未找到右上角按钮");
            }
        }
        console.log("-------------");
    } catch (e) {
        console.log(e);
        console.error("无法识别，请手动处理！！");
        device.vibrate(500);
        delay(5);
        return;
    }
}

// 获取填空题题目及空格
function getFitbQuestion() {
    var questionCollections = className("EditText").findOnce().parent().parent();
    var questionArray = [];
    var findBlank = false;
    var blankCount = 0;
    var blankNumStr = "";
    var i = 0;
    questionCollections.children().forEach(item => {
        if (item.className() != "android.widget.EditText") {
            if (item.text() != "") { // 题目段
                if (findBlank) {
                    blankNumStr = "|" + blankCount.toString();
                    questionArray.push(blankNumStr);
                    findBlank = false;
                }
                questionArray.push(item.text());
            } else {
                findBlank = true;
                blankCount = (className("EditText").findOnce(i).parent().childCount() - 1);
                i++;
            }
        }
    });
    return questionArray;
}


function getTipsStr() {
    console.log("查看提示");
    text("查看提示").findOne(3000).click();
    var tipsLine = text("提示").findOne().parent();
    // 获取提示内容
    var tipsView = tipsLine.parent().child(1).child(0);
    var tipsStr = tipsView.text();
    delay(0.5)
    console.log("关闭提示");
    tipsLine.child(1).click();
    return tipsStr;
}

function getAnswerFromTips(questionArray, tipsStr) {
    var ansTips = "";
    if (tipsStr.includes(questionArray[0])) {
        tipsStr = tipsStr.slice(tipsStr.indexOf(questionArray[0]));
    }
    console.log(tipsStr);
    for (var i = 1; i < questionArray.length - 1; i++) {
        if (questionArray[i].charAt(0) == "|") {
            var blankLen = questionArray[i].substring(1);
            if (questionArray[i + 1].length == 1) {
                var ansFind = tipsStr.substr(questionArray[i - 1].length, blankLen);
            } else {
                var indexKey = tipsStr.lastIndexOf(questionArray[i + 1]);
                var ansFind = tipsStr.substr(indexKey - blankLen, blankLen);
            }
            ansTips = ansTips.concat(ansFind);
        }
    }
    return ansTips;
}

// 获取选择题题目
function getChoiceQuestion() {
    var questionCollections = className("ListView").findOnce().parent().child(1);
    var questionArray = [];
    questionArray.push(questionCollections.text());
    return questionArray;
}

// 选择题勾选答案
function clickByTips(tipsStr) {
    var clickStr = "";
    let isFind = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOne().children();
        listArray.forEach(item => {
            var ansStr = item.child(0).child(2).text();
            if (tipsStr.indexOf(ansStr) >= 0) {
                item.child(0).click();
                clickStr += item.child(0).child(1).text().charAt(0);
                isFind = true;
            }
        });
        if (!isFind) { //没有找到 点击第一个
            listArray[0].child(0).click();
            clickStr += listArray[0].child(0).child(1).text().charAt(0);
        }
    }
    return clickStr;
}






function getTodayDateStr() {
    const date = new Date();
    const format = "yyyy-MM-dd"
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    let dateStr = format
        .replace("yyyy", year)
        .replace("MM", month)
        .replace("dd", day)
        .replace("HH", hours)
        .replace("mm", minutes)
        .replace("ss", seconds);
    return dateStr;
}

function getTodayWatchedTvNum() {
    let key = "TODAY_WATCHED_TV_NUM_" + getTodayDateStr();
    let num = CONFIG.get(key, 0);
    console.log("观看视频数量：" + num);
    return num;
}

function addTodayWatchedTvNum(num) {
    return CONFIG.put("TODAY_WATCHED_TV_NUM_" + getTodayDateStr(), getTodayWatchedTvNum() + num);
}