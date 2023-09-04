
// tikuObjct = {"战区"}

// let options = ['A','B','C','D']
// let map = new Map();
// for (const key in tikuObjct) {
//     if (Object.prototype.hasOwnProperty.call(tikuObjct, key)) {
//         const rightAnswer = tikuObjct[key].replace(/\s*/g,"");
//         let questions = key.split('|');
//         let question = questions[0];
//         question = question.replace(/\s*/g,"");

//         // if(question.includes('选择正确的字形。来源') || question.includes('选择正确的读音。来源') || question.includes('选择词语的正确词形。来源')){
//         //     continue 
//         // }

//         let answer_list = questions.slice(1);
//         var op;

//         let answers 
//         for(var i = 0; i < answer_list.length; i++){
//             answer_list[i] = answer_list[i].replace(/\s*/g,"");
//             if(answer_list[i] == rightAnswer){
//                 op = options[i];
//             }
//             answers = answer_list.join('	');
//         }
//         let row = op + " " + question + ' ' + answers;
//         map.set(row,1);
//     }
// }

// map.forEach(function(value,key){
//     console.log(key);
// });


// // let numberArray = "";
// // for(let number = 205100000544; number <= 205100000633; number ++){
// //     numberArray += number + ",";
// // }
// // console.log(numberArray);

// // let tvItemNameList = ['党史','竖','炫','窗','藏','靓'];
// // let tv_idx = 4;
// // let idx = tv_idx % tvItemNameList.length;
// // let tvItemName = tvItemNameList[tv_idx % tvItemNameList.length];
// // console.log(tvItemName);

// current_video_time = ' 00:25 / 01:00'

// subtime = current_video_time.slice(0, 3);
// console.log(subtime);

// const overOneMinute = Number(subtime) ;

// console.log(overOneMinute);

http.__okhttp__.setTimeout(10000);

let url = "https://raw.githubusercontent.com/JLGB/MyStudy/main/UI.js";

try{
    console.log(http.get(url).body.string())
}catch(e){
    console.log(e);
    console.error('脚本加载失败，已停止运行');

}