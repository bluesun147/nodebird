const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv'); // env

const passport = require('passport'); //로그인 모듈

// app.js
dotenv.config();

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth'); // 추가한 auth 라우터 app.js에 연결

const {sequelize} = require('./models'); // models/index.js (index 생략)

const passportConfig = require('./passport'); // ./passport/inex.js

const nunjucks = require('nunjucks'); // 템플릿 엔진 넌적스

const app = express();
passportConfig(); // 패스포트 설정
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({force: false})
.then(() => {
    console.log('데이터베이스 연결 성공!!');
})
.catch((err) => {
    console.error(err);
});

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));

app.use(passport.initialize()); // 요청(req)에 passport 설정 심고
app.use(passport.session()); // req.session 객체에 passport 정보 저장
// req.session 객체는 express-session에서 생성하는 것이므로
// passport 미들웨어는 express-session 미들웨어보다 뒤어 연결해야 함.

app.use('/', pageRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다!`);
    error.status = 404;
    next(error); // 에러 처리 미들웨어로 이동
})

app.use((err, req, res, next) => { // 에러 처리 미들웨어
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중!');
});