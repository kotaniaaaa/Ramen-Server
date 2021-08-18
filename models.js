import Sequelize from 'sequelize';

const { DataTypes } = Sequelize;

const url =
  process.env.DATABASE_URL ||
  'postgres://postgres:1234@localhost:5432/review_app';

// 引数の URL に対してデータベースの接続
export const sequelize = new Sequelize(url);

// Userテーブル定義
export const User = sequelize.define(
  'user',
  {
    sub: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { underscored: true }
);

// Restaurantsテーブル定義
export const Restaurant = sequelize.define(
  'restaurant',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    map: {
      type: DataTypes.TEXT,
    },
  },
  { underscored: true }
);

// Reviewテーブル定義
export const Review = sequelize.define(
  'review',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
      },
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Restaurant,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { underscored: true }
);

// テーブル間の関係定義
Restaurant.hasMany(Review);
Review.belongsTo(Restaurant);
User.hasMany(Review);
Review.belongsTo(User);
