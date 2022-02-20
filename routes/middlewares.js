// 로그인한 사용자가 회원가입이나 고르인 라우터에 접근하면 안됨. 이미 로그인 했기 때문
// 마찬가지로 로그인 하지 않은 사용자는 로그아웃 라우터에 접근하면 안됨.
// so 라우터에 접근 제한 권한 미들웨어 필요
// routes/middlewares.js

// passport는 req객체에 isAuthenticated 메서드를 추가.
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 중이면 true, 아니면 false
        next();
    } else {
        res.status(403).send('로그인 필요!!');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};