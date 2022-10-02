let detector;
let poses;
let video;
let Timeout = false;
let reloadcount = 0;
let highlightBack = false;
let backWarningGiven = false;

let videoready = false;

let PC = false;
let PHONE = false;

let vertical_screen = false;
let horizontal_screen = false;

const confidence_threshold = 0.6; //指定数値以上の精度の場合

let target_angle_l1 = "左膝 "; //部位名
let leftflexiontext_01 = 0;

let target_angle_l2 = "左腰 "; 
let leftflexiontext_02 = 0;

let target_angle_r1 = "右膝 ";
let rightflexiontext_01 = 0;

let target_angle_r2 = "右腰 ";
let rightflexiontext_02 = 0;

let conditions_count = 10;

let conditions_angle_1 = 95;
let conditions_angle_2 = 170;
let conditions_angle_3 = 150;

let KneeAboveHip = false;
let flag_1 = false;
let flag_2 = false;


async function init() {
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
    );
    edges = {
        '5,7': 'm',
        '7,9': 'm',
        '6,8': 'c',
        '8,10': 'c',
        '5,6': 'y',
        '5,11': 'm',
        '6,12': 'c',
        '11,12': 'y',
        '11,13': 'm',
        '13,15': 'm',
        '12,14': 'c',
        '14,16': 'c'
    };
}

async function videoReady() {
    videoready = true;
    console.log("video ready");
    await getPoses();
}

function switchByWidth() {
    //画面の向きを 0,90,180,-90 のいずれかで取得
    var orientation = window.orientation;

    if (orientation === 0) {
        /*  縦画面時の処理  */
        vertical_screen = true;
    } else {
        /*  横画面時の処理  */
        horizontal_screen = true;
    }

    //レスポンシブ対応
    if (window.matchMedia('(max-width: 767px)').matches) {
        createCanvas(screen.width, screen.height-100);//スマホ処理
        console.log("スマホ");
        PHONE = true;
    } else if(horizontal_screen == true){
        createCanvas(screen.height-100, screen.width);//スマホ横向き処理
        console.log("スマホ横向き");
        PHONE = true;
    } else if (window.matchMedia('(min-width:768px)').matches) {
        createCanvas(1280, 900);//PC処理
        console.log("PC");
        PC = true;
    }
    console.log(window.orientation);
}

async function setup() {

    switchByWidth();//キャンバス生成

    //ロードとリサイズの両方で同じ処理を付与する
    window.onload = switchByWidth;
    window.onresize = switchByWidth;

    video = createCapture(VIDEO, videoReady);
    video.size(width, height);
    // video.size(320, 240);
    video.hide();

    await init();

    // createButton('pose').mousePressed(getPoses);
}

async function getPoses() {

    poses = await detector.estimatePoses(video.elt);
    //console.log(poses);
    setTimeout(getPoses, 0);
    
}

function draw() {
    if (videoready == true && poses == undefined) {
        getPoses(); //エラー時の再取得
    }

    // console.log(poses);
    // console.log(video);

    background(220);
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);

    drawKeypoints();
    drawSkeleton();

    fill(255);
    strokeWeight(2);
    stroke(51);
    translate(width, 0);
    scale(-1, 1);
    textSize(40);

    DebugText();

    //flag系テキスト
    textSize(30);

    if (KneeAboveHip == true) {
        fill(0, 255, 0);
        text("体制チェック" + KneeAboveHip, width - 265, 30);
    } else {
        fill(200, 0, 0);
        text("体制チェック" + KneeAboveHip, width - 265, 30);
    }

    if (flag_1 == true) {
        fill(0, 255, 0);
        text("膝角度" + flag_1, width - 175, 60);
    } else {
        fill(200, 0, 0);
        text("膝角度" + flag_1, width - 175, 60);
    }

    if (flag_2 == true) {
        fill(0, 255, 0);
        text("腰角度" + flag_2, width - 175, 90);
    } else {
        fill(200, 0, 0);
        text("腰角度" + flag_2, width - 175, 90);
    }

    fill(200, 0, 0);
    anglereslt_1();//角度テキスト

    fill(200, 0, 0);
    anglereslt_2();
}

function DebugText(){
    let txtscore = "0.00";

    if (poses && poses.length > 0) {
        for (let kp of poses[0].keypoints) {
            const { score } = kp;

                txtscore = score.toFixed(2);//scoreを小数点2まで切り捨て
        }
    }
    text("score "+txtscore, 1, (height-1));
    text("count "+conditions_count, 220, (height-1));
}

function anglereslt_1(){
    //膝
    if ((leftflexiontext_01 < 100 && leftflexiontext_01 > 80 )|| (rightflexiontext_01 < 100 && rightflexiontext_01 > 80)){
        fill(0, 255, 0);

        text(target_angle_l1 + leftflexiontext_01 + "°", 1, 30);
        text(target_angle_r1 + rightflexiontext_01 + "°", 1, 90);

    } else{
        text(target_angle_l1 + leftflexiontext_01 + "°", 1, 30);
        text(target_angle_r1 + rightflexiontext_01 + "°", 1, 90);
    }
}

function anglereslt_2(){
    if ((flag_1 == true && leftflexiontext_02 > 140) || (flag_1 == true && rightflexiontext_02 > 140)) {
        fill(0, 255, 0);

        text(target_angle_l2 + leftflexiontext_02 + "°", 1, 60);
        text(target_angle_r2 + rightflexiontext_02 + "°", 1, 120);
    } else {
        text(target_angle_l2 + leftflexiontext_02 + "°", 1, 60);
        text(target_angle_r2 + rightflexiontext_02 + "°", 1, 120);
    }
}

function drawKeypoints(){

    if (poses && poses.length > 0) {
        for (let kp of poses[0].keypoints) {
            const { x, y, score } = kp;
            if (score > confidence_threshold) {
                fill(255);
                stroke(0);
                strokeWeight(4);
                 //描画がずれるため位置調整
                // console.log("x:"+x);
                circle(map(x, 0, 640, 0, width),
                       map(y, 0, 480, 0, height),
                       16);

                //顔隠し
                fill(255, 255, 255);
                ellipse(map(poses[0].keypoints[0].x, 0, 640, 0, width),
                        map(poses[0].keypoints[0].y, 0, 480, 0, height),
                        200);
                // circle(x, y, 16);
                // ellipse(map(x, 0, 640, 0, width), map(y, 0, 480, 0, height), 10, 10)

            }
            left_angle_1();
            left_angle_2();
            // console.log(leftflexiontext_01);
            right_angle_1();
            right_angle_2();

            conditions();
        }
    }
    
}

function drawSkeleton() {

    if (poses && poses.length > 0) {
        for (const [key, value] of Object.entries(edges)) {
            const p = key.split(",");
            const p1 = p[0];
            const p2 = p[1];

            const y1 = poses[0].keypoints[p1].y;
            const x1 = poses[0].keypoints[p1].x;
            const c1 = poses[0].keypoints[p1].score;
            const y2 = poses[0].keypoints[p2].y;
            const x2 = poses[0].keypoints[p2].x;
            const c2 = poses[0].keypoints[p2].score;

            if ((c1 > confidence_threshold) && (c2 > confidence_threshold)) {
                if ((highlightBack == true) && ((p[1] == 11) || ((p[0] == 6) && (p[1] == 12)) || (p[1] == 13) || (p[0] == 12))) {
                    strokeWeight(3);
                    stroke(255, 0, 0);
                    line(x1, y1, x2, y2);
                }
                else {
                    strokeWeight(2);
                    stroke('rgb(255, 255, 255)');
                    //描画がずれるため位置調整
                    line(map(x1, 0, 640, 0, width),
                         map(y1, 0, 480, 0, height),
                         map(x2, 0, 640, 0, width),
                         map(y2, 0, 480, 0, height));
                    // line(x1, y1, x2, y2);
                }
            }
        }
    }
}

function left_angle_1() {
    //左ひざの角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var leftHip = poses[0].keypoints[11];
    var leftKnee = poses[0].keypoints[13];
    var leftAnkle = poses[0].keypoints[15];

    const O1 = leftKnee; //中央
    const O2 = leftAnkle; //最下部
    const O3 = leftHip; //最上部

    if (O1.score > confidence_threshold && O2.score > confidence_threshold && O3.score > confidence_threshold){
        //3点座標から角度を計算
        let leftflexion = (
            Math.atan2(
                O3.y - O1.y,
                O3.x - O1.x
            )
            - Math.atan2(
                O2.y - O1.y,
                O2.x - O1.x
            )
        ) * (180 / Math.PI);
        leftflexion = Math.abs(leftflexion);
        if (leftflexion > 180) {
            leftflexion = Math.abs(leftflexion - 360);
    }else{
            // leftflexion = 0;
    }
        leftflexiontext_01 = Math.floor(leftflexion);//小数点切り捨て   
    }
}

function left_angle_2() {
    //左腰の角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var leftShoulder = poses[0].keypoints[5];
    var leftHip = poses[0].keypoints[11];
    var leftKnee = poses[0].keypoints[13];

    const O1 = leftHip; //中央
    const O2 = leftKnee; //最下部
    const O3 = leftShoulder; //最上部

    if (O1.score > confidence_threshold && O2.score > confidence_threshold && O3.score > confidence_threshold) {
        //3点座標から角度を計算
        let leftflexion = (
            Math.atan2(
                O3.y - O1.y,
                O3.x - O1.x
            )
            - Math.atan2(
                O2.y - O1.y,
                O2.x - O1.x
            )
        ) * (180 / Math.PI);
        leftflexion = Math.abs(leftflexion);
        if (leftflexion > 180) {
            leftflexion = Math.abs(leftflexion - 360);
        } else {
            // leftflexion = 0;
        }
        leftflexiontext_02 = Math.floor(leftflexion);//小数点切り捨て   
    }
}

function right_angle_1() {
    //右ひざの角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var rightHip = poses[0].keypoints[12];
    var rightKnee = poses[0].keypoints[14];
    var rightAnkle = poses[0].keypoints[16];

    const O1 = rightKnee; //中央
    const O2 = rightAnkle; //最下部
    const O3 = rightHip; //最上部

    if (O1.score > confidence_threshold && O2.score > confidence_threshold && O3.score > confidence_threshold) {
        //3点座標から角度を計算
        let rightflexion = (
            Math.atan2(
                O3.y - O1.y,
                O3.x - O1.x
            )
            - Math.atan2(
                O2.y - O1.y,
                O2.x - O1.x
            )
        ) * (180 / Math.PI);
        rightflexion = Math.abs(rightflexion);
        if (rightflexion > 180) {
            rightflexion = Math.abs(rightflexion - 360);
        } else {
            // rightflexion = 0;
        }
        rightflexiontext_01 = Math.floor(rightflexion);//小数点切り捨て   
    }
}

function right_angle_2() {
    //右腰の角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var rightShoulder = poses[0].keypoints[6];
    var rightHip = poses[0].keypoints[12];
    var rightKnee = poses[0].keypoints[14];

    const O1 = rightHip; //中央
    const O2 = rightKnee; //最下部
    const O3 = rightShoulder; //最上部

    if (O1.score > confidence_threshold && O2.score > confidence_threshold && O3.score > confidence_threshold) {
        //3点座標から角度を計算
        let rightflexion = (
            Math.atan2(
                O3.y - O1.y,
                O3.x - O1.x
            )
            - Math.atan2(
                O2.y - O1.y,
                O2.x - O1.x
            )
        ) * (180 / Math.PI);
        rightflexion = Math.abs(rightflexion);
        if (rightflexion > 180) {
            rightflexion = Math.abs(rightflexion - 360);
        } else {
            // rightflexion = 0;
        }
        rightflexiontext_02 = Math.floor(rightflexion);//小数点切り捨て   
    }
}

function conditions() {

    if (poses[0].keypoints[13].scpre > confidence_threshold || poses[0].keypoints[14].scpre > confidence_threshold){//腰のスコアが一定以上の場合
        if ((poses[0].keypoints[13].y < poses[0].keypoints[11].y) && (poses[0].keypoints[14].y < poses[0].keypoints[12].y)) {//腰の位置が膝より低い場合
            KneeAboveHip = true;
        } else {
            KneeAboveHip = false;
        }
    }

    if(KneeAboveHip == true){
        if ((leftflexiontext_01 < 100 && leftflexiontext_01 > 80) || (rightflexiontext_01 < 100 && rightflexiontext_01 > 80)){
            flag_1 = true;
        } else {
            flag_1 = false;
        }

        if (flag_1 == true){
            if ((flag_2 == false && leftflexiontext_02 >= 135) || (flag_2 == false && rightflexiontext_02 >= 135)) {
                flag_2 = true;
            } else if ((flag_2 == true && leftflexiontext_02 <= 110) || (flag_2 == true && rightflexiontext_02 <= 110)) {
                if(conditions_count > 0){
                    conditions_count -= 1;
                }
                flag_2 = false;
            }
        }
    }
}