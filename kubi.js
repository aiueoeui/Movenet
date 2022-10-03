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

let target_angle_l1 = "左肩 "; //部位名
let leftflexiontext_01 = 0;

let target_angle_l2 = "左肘 ";
let leftflexiontext_02 = 0;

let target_angle_r1 = "右肩 ";
let rightflexiontext_01 = 0;

let target_angle_r2 = "右肘 ";
let rightflexiontext_02 = 0;

let Lefttimerflag = false;
let Righttimerflag = false;

let Rightconditions_count = 10;
let Leftconditions_count = 10;

let conditions_angle_1 = 95;
let conditions_angle_2 = 170;
let conditions_angle_3 = 150;

let LeftWristAbovenose = false;
let RightWristAbovenose = false;
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

    if (orientation == 0 || orientation == undefined) {
        /*  縦画面時の処理  */
        vertical_screen = true;
        horizontal_screen = false;
    } else {
        /*  横画面時の処理  */
        horizontal_screen = true;
        vertical_screen = false;
    }

    //レスポンシブ対応
    if (window.matchMedia('(max-width: 767px)').matches) {
        createCanvas(screen.width, screen.height);//スマホ処理
        console.log("スマホ");
        PHONE = true;
    } else if (horizontal_screen == true) {
        createCanvas(screen.height - 100, screen.width);//スマホ横向き処理
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

    //デバッグテキスト
    fill(255);
    strokeWeight(2);
    stroke(51);
    translate(width, 0);
    textAlign(LEFT, BOTTOM);
    scale(-1, 1);
    textSize(40);

    DebugText();

    //flag系テキスト
    textSize(30);

    if (RightWristAbovenose == true) {
        fill(0, 255, 0);
        textAlign(RIGHT, TOP);
        text("体制チェック" + RightWristAbovenose, width, 1);
    } else {
        fill(200, 0, 0);
        textAlign(RIGHT, TOP);
        text("体制チェック" + RightWristAbovenose, width, 1);
    }

    if (flag_1 == true) {
        fill(0, 255, 0);
        text("肩角度" + flag_1, width, 30);
    } else {
        fill(200, 0, 0);
        text("肩角度" + flag_1, width, 30);
    }

    if (flag_2 == true) {
        fill(0, 255, 0);
        text("肘角度" + flag_2, width, 60);
    } else {
        fill(200, 0, 0);
        text("肘角度" + flag_2, width, 60);
    }

    //角度テキスト
    fill(200, 0, 0);
    textAlign(LEFT, TOP);
    anglereslt_1();

    //角度テキスト
    fill(200, 0, 0);
    textAlign(LEFT, TOP);
    anglereslt_2();
}

function DebugText() {
    let txtscore = "0.00";

    if (poses && poses.length > 0) {
        for (let kp of poses[0].keypoints) {
            const { score } = kp;

            txtscore = score.toFixed(2);//scoreを小数点2まで切り捨て
        }
    }
    fill(255);
    text("score " + txtscore, 1, (height - 1));
    if (Leftconditions_count == 0) {
        fill(0, 200, 0);
        text("Lcount " + Leftconditions_count, 220, (height - 1));
    } else {
        fill(255);
        text("Lcount " + Leftconditions_count, 220, (height - 1));
    }

    if (Rightconditions_count == 0) {
        fill(0, 200, 0);
        text("Rcount " + Rightconditions_count, 440, (height - 1));
    } else {
        fill(255);
        text("Rcount " + Rightconditions_count, 440, (height - 1));
    }
}

function anglereslt_1() {
    //肩
    if (flag_1 == true) {
        fill(0, 255, 0);

        text(target_angle_l1 + leftflexiontext_01 + "°", 1, 1);
        text(target_angle_r1 + rightflexiontext_01 + "°", 1, 60);

    } else {
        text(target_angle_l1 + leftflexiontext_01 + "°", 1, 1);
        text(target_angle_r1 + rightflexiontext_01 + "°", 1, 60);
    }
}

function anglereslt_2() {
    //肘
    if (flag_2 == true) {
        fill(0, 255, 0);

        text(target_angle_l2 + leftflexiontext_02 + "°", 1, 30);
        text(target_angle_r2 + rightflexiontext_02 + "°", 1, 90);
    } else {
        text(target_angle_l2 + leftflexiontext_02 + "°", 1, 30);
        text(target_angle_r2 + rightflexiontext_02 + "°", 1, 90);
    }
}

function drawKeypoints() {

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

                // //顔隠し
                if (PHONE == true) {
                    fill(255, 255, 255);
                    ellipse(map(poses[0].keypoints[0].x, 0, 640, 0, width),
                        map(poses[0].keypoints[0].y, 0, 480, 0, height),
                        50);
                } else {
                    fill(255, 255, 255);
                    ellipse(map(poses[0].keypoints[0].x, 0, 640, 0, width),
                        map(poses[0].keypoints[0].y, 0, 480, 0, height),
                        200);
                }
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
    //左肩の角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var leftShoulder = poses[0].keypoints[5];
    var leftElbow = poses[0].keypoints[7];
    var leftHip = poses[0].keypoints[11];

    const O1 = leftShoulder; //中央
    const O2 = leftHip; //最下部
    const O3 = leftElbow; //最上部

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
        leftflexiontext_01 = Math.floor(leftflexion);//小数点切り捨て   
    }
}

function left_angle_2() {
    //左肘の角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var leftShoulder = poses[0].keypoints[5];
    var leftElbow = poses[0].keypoints[7];
    var leftWrist = poses[0].keypoints[9];

    const O1 = leftElbow; //中央
    const O2 = leftWrist; //最下部
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
    //右肩の角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var rightShoulder = poses[0].keypoints[6];
    var rightElbow = poses[0].keypoints[8];
    var rightHip = poses[0].keypoints[12];

    const O1 = rightShoulder; //中央
    const O2 = rightHip; //最下部
    const O3 = rightElbow; //最上部

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
    //右肘の角度

    //鼻:0 左目:1 右目:2 左耳:3 右耳:4 左肩:5 右肩:6 左ひじ:7 右ひじ:8 左手首:9 右手首:10 左腰:11 右腰:12 左ひざ:13 右ひざ:14 左足首:15 右足首:16

    var rightShoulder = poses[0].keypoints[6];
    var rightElbow = poses[0].keypoints[8];
    var rightWrist = poses[0].keypoints[10];

    const O1 = rightElbow; //中央
    const O2 = rightWrist; //最下部
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

        if (poses[0].keypoints[7].score >= confidence_threshold || poses[0].keypoints[8].score >= confidence_threshold) {//肘のスコアが一定以上の場合

            if ((poses[0].keypoints[9].y < poses[0].keypoints[0].y)) {//鼻の位置が左手首より低い場合
                LeftWristAbovenose = true;
            } else {
                LeftWristAbovenose = false;
            }

            if ((poses[0].keypoints[10].y < poses[0].keypoints[0].y)) {//鼻の位置が右手首より低い場合
                RightWristAbovenose = true;
            } else {
                RightWristAbovenose = false;
            }

        if (LeftWristAbovenose == true) {//左傾け肩角度チェック
            if ((rightflexiontext_01 > 0 && rightflexiontext_01 < 25) && (leftflexiontext_01 > 80 && leftflexiontext_01 < 100)) {
                flag_1 = true;
            } else {
                flag_1 = false;
            }

            //右傾け肘角度チェック
            if ((leftflexiontext_02 >= 40 && leftflexiontext_02 <= 55)) {
                flag_2 = true;
            } else {
                flag_2 = false;
            }


            if (flag_1 == true && flag_2 == true) {
                Lefttimerflag = true;
            } else {
                Lefttimerflag = false;
            }
        }

        if (RightWristAbovenose == true) {//右傾け肩角度チェック
            if ((rightflexiontext_01 > 80 && rightflexiontext_01 < 100) && (leftflexiontext_01 > 0 && leftflexiontext_01 < 25)) {
                flag_1 = true;
            } else {
                flag_1 = false;
            }

                //右傾け肘角度チェック
                if ((rightflexiontext_02 >= 40 && rightflexiontext_02 <= 55)) {
                    flag_2 = true;
                } else {
                    flag_2 = false;
                }
            

            if (flag_1 == true && flag_2 == true) {
                Righttimerflag = true;
            } else {
                Righttimerflag = false;
            }
        }
    }
}
//近似値の場合にカウント増加
setInterval(function () {

    if (Lefttimerflag == true) {
        if (Leftconditions_count > 0) {
            Leftconditions_count -= 1;
        }
    }

    if (Righttimerflag == true) {
        if (Rightconditions_count > 0) {
            Rightconditions_count -= 1;
        }
    }
}, 1000);