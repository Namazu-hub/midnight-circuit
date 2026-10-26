# MIDNIGHT CIRCUIT — 真夜中の修理屋

夜の研究室を探索するブラウザ用2Dアクションゲーム。通常8ステージ、レール台車、3Dプリンター内部、学生の会話、残機制、抽選フィーバーを収録しています。

v4では高所ルート、3種類の追加修理、ネジ落下、8種類の追加敵、3段レール、暴走ロボット戦を追加しました。旧セーブの記録と8ステージの順番を維持します。

## 起動

通常は[ゲームを開く](https://namazu-hub.github.io/midnight-circuit/)だけで遊べます。パソコン・スマートフォンとも同じURLです。公開処理の状態は[GitHub Actions](https://github.com/Namazu-hub/midnight-circuit/actions/workflows/deploy.yml)で確認できます。

### 手元で開発する場合

ビルドやnpmパッケージのインストールは不要です。Python 3がある環境で、このフォルダーから実行します。

~~~sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
~~~

ブラウザで http://127.0.0.1:8000/ を開きます。ESモジュールを使用するため、index.htmlのダブルクリック（file://）ではなくHTTPで配信してください。実行にはNode.jsやChatGPTは不要です。

## 操作

| 操作 | キー・画面操作 |
| --- | --- |
| 移動 | ← → / A D |
| 二段ジャンプ | Space / Z / ↑ / W |
| パルス | X / Shift |
| 一時停止 | Esc / P / 一時停止ボタン |
| チェックポイント再開 | R または一時停止画面のボタン（1機消費） |
| 台車 | 左で減速、右で加速、台車ごとジャンプ。3段分岐ではQ/Eまたは上段/下段ボタンで切替 |
| スマートフォン | 画面の左右・ジャンプ・パルスボタン |

HP6、残機3で開始。落下はHPを1失い、HP0で1機失います。残機0で冒険の進行をリセット。モンエナは9秒間の虹色加速です。音は任意で初期状態はオフ、演出軽減設定があります。

## 開発チェック

Node.js 22以上（今回の確認環境は24）。依存パッケージのインストールは不要です。

~~~sh
npm run check
npm test
npm run verify:baseline
~~~

最後のコマンドは移行時の元版との一致検査です。今後ゲームを意図的に変更した場合、不一致になるのが正常です。基準ハッシュを書き換えて差異を隠さないでください。テストだけで実機の操作感や音質は保証できません。

## 構成と資料

| 場所 | 内容 |
| --- | --- |
| dist/ | 配信するHTML・CSS・ESモジュール |
| tests/ | 既存15テスト、全ステージ経路の入力ドライバー |
| scripts/ | 構文・参照・移行一致チェック |
| assets/ | 将来の差し替え素材の受け入れ場所。現版では未読込 |
| docs/ | 下記資料、元版記録、照合用データ |
| AGENTS.md | Codex等の開発ルール |

- [仕様書](docs/SPECIFICATION.md)
- [コード構造・依存関係](docs/ARCHITECTURE.md)
- [GitHub登録・バックアップ復元](docs/MIGRATION.md)
- [素材差し替え方針](docs/ASSETS.md)
- [検証結果](docs/VALIDATION.md)
- [改善計画](docs/IMPROVEMENT_PLAN.md)
- [元版README](docs/ORIGINAL-README-v3.md)

ステージ・会話の正本はdist/levels.mjsです。docs内のinventory JSONは照合用で、編集してもゲームには反映されません。

## 移行の状態

ソースは公開リポジトリ[Namazu-hub/midnight-circuit](https://github.com/Namazu-hub/midnight-circuit)で管理しています。2026-10-25にフォルダー構造を復元し、ゲーム本体の内容を変えずに保存しました。復元前の状態は`backup/before-folder-repair-2026-10-25-584a637`ブランチに残しています。元のWork側サイトは変更していません。

GitHub PagesのSourceはGitHub Actionsを選択します。`.github/workflows/deploy.yml`がmainへのpush時に構文・参照チェックとゲームの自動テストを実行し、両方成功するとdist/のみを公開します。ビルドや依存パッケージのインストールは不要です。テスト失敗時は公開せず、直前の公開版が維持されます。

今後の改造は変更内容を実装・確認してmainへ保存（またはプルリクエストをマージ）すると、同じ公開URLへ自動反映されます。Actionsの実行が成功してからブラウザを再読み込みしてください。手動の再公開はActions → Deploy to GitHub Pages → Run workflowから実行できます。

セーブはブラウザのlocalStorageに保存され、別URLへ自動では引き継がれません。ソースのバックアップと各ブラウザのセーブデータは別です。

外部のゲーム用画像・音声ファイルは現版にはなく、Canvas/SVGとWeb Audio合成を使用しています。docsのJPEGは元からある画面記録です。公開ライセンスは今回新たに設定していません。

## GitHub Pages公開時の確認

2026-10-25の初回公開処理は成功しました（[実行記録](https://github.com/Namazu-hub/midnight-circuit/actions/runs/40192123218)）。ローカルの構文・参照チェック、既存15テスト、元版との一致検査も成功しています。

公開URLではブラウザでタイトル、8ステージの選択画面、ステージ1開始、HP6・残機3の表示、一時停止画面を確認しました。スマートフォン実機での操作・性能、および公開版の全ステージ通しプレイは未検証です。全8コースの経路確認は自動入力による物理テストです。

詳細は[v4仕様と検証記録](docs/EXPANSION-v4.md)を参照してください。
