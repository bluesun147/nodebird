const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const pageRouter = require('./routes/page');
const nunjucks = require('nunjucks');

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json);
app.use(express.urlencoded({extended: false}));

app.use(cookieParser(process.env.COOLIE_SECRET));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));

app.use('/', pageRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
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
    console.log(app.get('port'), '번 포트에서 대기 중');
});