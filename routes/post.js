// input태그 통해 이미지 선택할 때 바로 업로드 진행하고,
// 업로드된 사진 주소 다시 클라이언트에 알림
// 게시글 저장 시에는 db에 이미지 데이터 넣는 대신 이미지 경로만 저장
// 이미지는 서버 디스크에 저장됨.

const express = require('express');
const multer = require('multer'); // 이미지, 파일 시 사용
const path = require('path');
const fs = require('fs');

const {Post, Hashtag} = require('../models');
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024},
});

// POST /post/img 라우터
// app.use('/post') 할 것이므로 앞에 /post 경로 붙었음.
// 이미지 하나 업로드받은 뒤 이미지 저장 경로 클라이언트로 응답
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({url: `/img/${req.file.filename}`});
});

const upload2 = multer();
// POST /post 라우터
// 게시글 업로드 처리하는 라우터
// 이전 라우터에서 이미지 업로드 했다면 이미지 주소도 req.body.url로 전송됨
// 이미지 데이터가 들어있지 않으므로 none 메서드 사용
// 이미지 주소가 온것일 뿐, 이미지는 이미 POST /post/ing 라우터에서 저장되었음.
router.post('/', isLoggedIn, upload2.none(), async(req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });
        // 게시글 db에 저장한 후 글 내용에서 해시태그 정규표현식으로 추출.
        const hashtags = req.body.content.match(/#[^\s#]+/g);
        if (hashtags) { // 추출한 해시태그 db에 저장
            const result = await Promise.all(
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({ // 저장에 findOrCreate 메서드 사용. db에 해시태그 있으면 가져오고, 없으면 생성 후 가져옴
                        where: {title: tag.slice(1).toLowerCase()}, // #떼고 소문자로 바꿈
                    })
                }),
            );
            // 결과값으로 [모델, 생성 여부] 반환하므로 map 이용해 모델만 추출 ([모델, bool])
            await post.addHashtags(result.map(r => r[0])); // addHashtags로 게시글과 연결
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;