# メガネDinoの仕様

Chromiumの標準Dinoを基準にしています
描画はこのサイトのメガネを使い、ゲーム処理はフレームごとの状態更新として実装しています

- 初速6・最高速13・加速度0.001を60fps基準で使用
- 横幅600未満は画面幅と係数1.2で初速を調整
- 重力0.6・初期ジャンプ速度10＋速度/10・最低高さ30・キー解放時の速度5
- ↓キーでしゃがみ、空中では急降下
- 最初の3秒は障害物なし
- 大小のサボテン・1〜3本のまとまり・速度8.5以上で飛行障害物
- 障害物の間隔は幅・速度・係数0.6で計算し、上限係数1.5までランダム化
- 走行距離×0.025を丸めて得点に換算
- 100点ごとの通知、700点ごとの夜の表示
- 時間制限なし。ランキング用の操作履歴は短い区間に分けて検証

参照元

- [Runnerと設定値](https://chromium.googlesource.com/chromium/src/+/main/components/neterror/resources/dino_game/offline.ts)
- [ジャンプ・しゃがみ](https://chromium.googlesource.com/chromium/src/+/main/components/neterror/resources/dino_game/trex.ts)
- [障害物の寸法と衝突判定](https://chromium.googlesource.com/chromium/src/+/main/components/neterror/resources/dino_game/offline_sprite_definitions.ts)
- [距離からスコアへの換算](https://chromium.googlesource.com/chromium/src/+/main/components/neterror/resources/dino_game/distance_meter.ts)

Chromium由来の設定値・衝突形状の帰属とライセンスは`LICENSES/chromium.txt`に記載しています
