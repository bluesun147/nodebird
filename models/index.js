const Sequelize = require('sequelize');
// models.index.js
const env = process.env.MODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Hastag = require('./hashtag');

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// db에 담기
db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hastag = Hastag;

User.init(sequelize);
Post.init(sequelize);
Hastag.init(sequelize);

User.associate(db);
Post.associate(db);
Hastag.associate(db);
// 각 모델들을 시퀄라이즈 객체에 연결함.

module.exports = db;