const Sequelize = require('sequelize');
// models.post.js
// 게시글 모델. 게시글 내용, 이미지 경로 저장 
module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            },
            img: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate(db) {
        db.Post.belongsTo(db.User); // 1(User):N(Post) 관계.

        // Post와 Hashtag는 N:M 관계
        // N:M이므로 PostHashtag라는 중간 모델 생기고,
        // 각각 postId, hashtagId라는 foreighKey 추가됨
        db.Post.belongsToMany(db.Hashtag, {
            through: 'PostHashtag'
        });
    };
}