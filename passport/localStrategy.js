const passport = require('passport');
const LoacalStrategy = require('passport-local').Strategy;
const bcryt = require('bcrypt'); // 암호화
// 로그인 전략 구현
const User = require('../models/user');
module.exports = () => {
    passport.use(new LoacalStrategy({ // passport-local 모듈에서 Strategy 생성자 불러와 그 안에 전략 구현
        usernameField: 'email',
        passwordField: 'password', // 일치하는 로그인 라우터의 req.body 속성명 적으면 됨.
         // req.body.email에는 이메일 주소가, req.body.password에는 비밀 번호 담겨 들어오므로 각각 넣음.

         // 실제 전략 수행하는 async 함수. LoacalStrategy 생성자이 두번째 인수
    }, async (email, password, done) => { // email, password는 첫인수에서 넣은 값, done는 authenticate의 콜백 함수
        try {
            const exUser = await User.findOne({where: {email}}); // 먼저 사용자 db에서 일치하는 이메일 찾고 
            if (exUser) { // 있다면 
                const result = await bcryt.compare(password, exUser.password); // 비밀번호를 비교
                if (result) { // 일치한다면 
                    done(null, exUser); // done 함수의 두번째 인수로 사용자 정보 넣어 보냄
                    // done의 두번째 인수 사용 안하는 경우는 로그인 실패했을 때 뿐.
                    // 첫번째 인수 사용하는 경우는 서버쪽에서 에러 발생한 경우
                    // 세번째 사용 경우는 로그인 처리 과정에서 비밀번호 일치하지 않거나 존재하지 않는 회원같은 사용자 정의 에러 발생했을 때.
                } else {
                    done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
                }
            } else {
                done(null, false, {message: '가입되지 않은 회원입니다.'});
            }
            // done 호출된 후에는 다시 passport.authenticate의 콜백 함수에 나머지 로직 실행 됨.
            // 로그인에 성공 했다면 메인 페이지로 리다이렉트되면서 로그인 폼 대신 회원 정보 뜸.
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};