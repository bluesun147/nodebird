const Sequelize = require('sequelize');
// models/hashtag.js
// 태그 이름 저장. 해시태그 모델 따로 두는 이유는 나중에 태그로 검색하기 위해
module.exports = class Hashtag extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Hashtag',
            tableName: 'hashtags',
            paranoid: false,
            charset: utf8mb4,
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate(db) {
        db.Hashtag.belongsToMany(db.Post, {
            through: 'PostHashtag'
        });
    };
}

/* 
NodeBird 모델을 총 다섯 개.
직접 생성한 3개, User, Hashtag, Post
시퀄라이즈가 관계 파악해 생성한 2개, PostHashtag, Follow

자동 생성된 모델도 다음과 같이 접근 가능.
db.sequelize.models.PostHashtag
db.sequelize.models.Follow
*/
