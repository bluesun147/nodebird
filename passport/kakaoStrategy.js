const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;

const User = ('../models/user');

module.exports = () => {
    // 카카오 로그인 설정
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_ID, // 카카오에서 발급해주는 아이디. 노출되지 않아야 하므로 env
        callbackURL: '/auth/kakao/callback', // 카카오로부터 인증 받을 라우터 주소

    // 
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile);
        try { // 기존에 카카오 통한 회원가입한 사용자 있는지 조회
            const exUser = await User.findOne({
                where: {snsId: profile.Id, provider: 'kakao'},
            });
            if (exUser) { // 있다면 이미 회원가입되었다는 뜻.
                done(null, exUser); // 사용자 정보와 함께 done 함수 호출하고 전략 종료


            } else { // 없다면 회원가입 진행
                // 카카오에서는 인증 후 callbackURL에 적힌 주소로 accessToken, refreshToken, profile 보냄.
                // profile에는 사용자 정보 들어있음. 
                // profile 객체에서 원하는 정보 꺼내와 회원가입 하면 됨.
                const newUser = await User.create({
                    email: profile._json && profile._json.kakao_account_email,
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
        }
    }))
}