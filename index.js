import express from 'express';
import cors from 'cors';
import sequelize from 'sequelize';
import { Restaurant, Review, User } from './models.js';

// Expressアプリケーションのインスタンス作成
const app = express();

app.use(cors());

// エンドポイント /restaurants に対する処理
app.get('/restaurants', async (req, res) => {
  const limit = +req.query.limit || 5; // 取得件数
  const offset = +req.query.offset || 0; // リストの何番目から取得を行うか
  const restaurants = await Restaurant.findAndCountAll({
    attributes: {
      include: [
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM reviews AS r WHERE r.restaurant_id = restaurant.id)`
          ),
        ],
      ],
    },
    include: { model: Review, limit: 3, include: { model: User } }, // 一つの店につき3件のレビュー
    order: [[sequelize.literal('review_count'), 'DESC']], // レビュー件数の降順でソート
    limit,
    offset,
  });
  res.json(restaurants);
  // 仮データを使わなくなったのでコメントアウト
  // res.json({
  //   rows: restaurants.slice(offset, offset + limit), // ラーメン店の情報の配列
  //   count: data.restaurants.length, // サンプルデータにあるラーメン店の全件数
  // });
});

// app.get(path, handler)で、pathに対するGETリクエストをhandlerの関数で処理することが可能。
// 変数などのオペランドの前に+があるのは、「単項プラス」という

// エンドポイント /restaurants/:restaurantId に対する処理
app.get('/restaurants/:restaurantId', async (req, res) => {
  // ラーメン店ID取得
  const restaurantId = +req.params.restaurantId;
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    // IDが見つからなかった
    res.status(404).send('not found');
    return;
  }
  res.json(restaurant);
});

// エンドポイント /restaurants/:restaurantId/reviews に対する処理
app.get('/restaurants/:restaurantId/reviews', async (req, res) => {
  const restaurantId = +req.params.restaurantId;
  const limit = +req.query.limit || 5;
  const offset = +req.query.offset || 0;
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    res.status(404).send('not found');
    return;
  }

  const reviews = await Review.findAndCountAll({
    include: { model: User }, // レビューを書いたユーザーの情報を含ませてレスポンスする
    where: { restaurantId },
    limit,
    offset,
  });
  res.json(reviews);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

// app.listen(port, handler)で、ポート番号を指定してサーバーを起動し、起動が終わった後の処理をhandlerで行う
// ローカル開発では5000番を使うが、Heroku公開後はポート番号が環境変数で渡されるため、環境変数に「PORT」が設定されていたらその番号を使うように設定した。
