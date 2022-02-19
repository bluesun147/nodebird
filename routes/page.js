const express = require('express');
// routes/page.js
const router = express.Router();

// 라우터용 미들웨어 만들어 템플릿 엔진에서 사용할 변수들 res.locals로 설정
// res.locals로 값 설정하는 이유는 모든 템플릿 엔진에서 공통으로 사용하기 때문 
router.use((req, res, next) => {
    /* res.render 메서드 두번때 신수로 변수 객체 넣는 대신
    res.locals 사용해 변수 넣을 수 있음.

    res.render('index', {title: 'Express'}) 대신

    res.locals.title = 'Express';
    res.render('index');
    
    이렇게하면 템플릿 엔진이 res.locals 객체 읽어서 변수 접어넣음
    */
    res.locals.user = null;
    res.locals.followerCount = 0;
    res.locals.followingCount = 0;
    res.locals.followerIdList = [];
    next();
});

// GET /profile
router.get('/profile', (req, res) => {
    res.render('profile', {title: '내 정보 - NodeBird'});
});

// GET /join
router.get('/join', (req, res) => {
    res.render('join', {title: '회원가입 - NodeBird'});
});

// GET /
router.get('/', (req, res, next) => {
    const twits = [];
    res.render('main', {
        title: 'NodeBird',
        twits,
    });
});

module.exports = router;