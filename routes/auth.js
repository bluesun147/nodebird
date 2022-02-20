const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt'); // 비밀번호 암호화에 사용
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const { findOne } = require('../models/user');

const router = express.Router();

// 회원가입 라우터
router.post('./join', isNotLoggedIn, async(req, res, next) => {
    const {email, nick, password} = req.body;
    try {
        const exUser = await User.findOne({where: {email}});

        if (exUser) { // 기존에 같은 이메일로 가입한 사용자 있는지 조회한 뒤, 있다면 회원가입 페이지로 되돌려보냄
            return res.redirect('/join?error=exist'); // 그때 주소뒤에 에러를 쿼리스트링으로 표시
        }
        // 없다면
        // 12는 암호화 반복 횟수와 비슷
        const hash = await bcrypt.hash(password, 12); // 비밀번호 암호화하고
        await User.create({ // 사용자 정보 생성 (sequelize)
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

// 로그인 라우터
router.post('/login', isNotLoggedIn, (req, res, next) => {
    // 로그인 요청이 들어오면 passport.authenticate('local') 미들웨어가 로컬 로그인 전략 수행함
    // 미들웨어인데 라우터 미들웨어 안에 들어있음.
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => { // passport.serializeUser 호출
            // req.login에서 제공하는 user객체가 serializeUser로 넘어감
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        })
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next) 붙임
});

// 로그아웃 라우터
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(); // req.user 객체 제거
    req.session.destroy(); // req.session 객체 내용 제거
    res.redirect('/'); // 세션 정보 지운 후 메인 페이지로 되돌아감
})

// 나중에 app.js와 연결될 때 /auth 접두사 붙일 것이므로 라우터 주소는 각각 /auth/join, /auth/login.. 이 됨.
module.exports = router;