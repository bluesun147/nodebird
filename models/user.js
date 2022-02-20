const Sequelize = require('sequelize');
// models/user.js
// 사용자 정보 저장하는 모델
module.exports = class User extends Sequelize.Model {
    static init(sequelize) { // 테이블에 대한 설정
        return super.init({ // 첫번째 인수는 테이블 컬럼 설정
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            provider: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local', // local이면 로컬 로그인, kakao면 카카오 로그인 한 것.
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, { // 두번째 인수는 테이블 옵션
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true, // deletedAt column이 테이블에 추가됨. 실제 삭제 안됐지만 삭제된 효과
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) { // 다른 모델과의 관계
        db.User.hasMany(db.Post); // 1(User):N(Post) 관계.

        // 같은 모델끼리도 N:M 관계 가질 수 있음
        // ex) User끼리 팔로잉. User모델과 User모델간의 N:M관계
        db.User.belongsToMany(db.User, { 
            foreignKey: 'followingId',
            as: 'Followers',
            // 같은 테이블간 N:M 관계에서는 모델이름과 컬럼이름 따로 정해야 함.
            through: 'Follow', // through 옵션 사용해 생성한 모델 이름 Follow로 설정.
        });
        db.User.belongsToMany(db.User, { 
            foreignKey: 'followerId', // foreignKey로 두 사용자 아이디 구별
            // 같은 테이블간 N:M 관계에서는 as 옵션도 넣어야 함.
            // 주의할 점은 foreignKey와 반대되는 모델 가리킴.
            // f가 followerId면 as 는 Followings.
            // 팔로워(Followers) 찾으려면 먼저 팔로잉 하는 사람의 아이디(followerId) 찾아야 함.
            as: 'Followings',
            through: 'Follow',
        });
    };
}