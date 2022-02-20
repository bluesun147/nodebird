// passport/index.js
const passport = require('passport');
const local = require('./localStrategy'); // 로컬 로그인
const kakao = require('./kakaoStrategy'); // 카카오 로그인 전략
const User = require('../models/user');

module.exports = () => { // 밑 두 메서드가 Passport의 핵심
    // 로그인 시에만 실행.
    // req.session(세선) 객체에 어떤 데이터 저장할 지 정하는 메서드
    // 사용자 정보 들어있음
    passport.serializeUser((user, done) => {
        done(null, user.id); // 첫번째 인자는 에러 발생시 사용, 두번째 인자에 저장하고 싶은 데이터
        // 로그인 시 사용자 데이터 세션에 저장.
        // 세션에 사용자 정보 모두 저장 시 용량 커짐.
        // 따라서 아이디만 저장.
    });

    /* 
    매 요청 시 실행됨
    passport.session 미들웨어가 이 메서드 호출.
    serialiseUser done 두번째 인수(user.id)가 deserializeUser 매개변수가 됨.
    조금 전에 serialiseUser에서 세션에 저장했던 아이디 받아 db에서 사용자 정보 조회.
    조회한 정보 req.user에 저장하므로 앞으로 req.user 통해 로그인한 사용자 정보 가져올 수 있음.
    */
    passport.deserializeUser((id, done) => { // id는 위에서의 user.id
        User.findOne({where: {id}})
        .then(user => done(null, user)) // user를 req.user에 저장
        .catch(err => done(err));
    });
    /* 즉 serialiseUser는 사용자 정보 객체 세션에 아이디로 저장하고,
    deserializeUser는 세션에 저장한 아이디 통해 사용자 정보 객체 불러옴.
    세션에 불필요한 데이터 담지 않기 위한 과정.
    */
   /*전체 과정
   1. 라우터 통해 로그인 요청 들어옴.
   2. 라우터에서 passport.authenticate 메서드 호출
   3. 로그인 전략 수행
   4. 로그인 성공 시 사용자 정보 객체와 함께 req.login 호출
   5. req.login 메서드가 passport.serialiseUser 호출
   6. req.session에 사용자 아이디만 저장
   7. 로그인 완료
   ==> 5~7 구현.

   로그인 이후 과정
   1. 요청 들어옴.
   2. 라우터에 요청 도달하기 전에 passport.session이 passport.deserializeUser 호출
   3. req.session에 저장된 아이디로 db에서 사용자 조회
   4. 조회된 사용자 정보 req.user에 저장
   5. 라우터에서 req.user 객체 사용 가능

   */

    local();
    kakao();
}
