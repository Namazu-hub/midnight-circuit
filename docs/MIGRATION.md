# GitHub登録とバックアップ復元

## 今回の状態

公開済みv3とソースコミットの一致を確認し、全追跡ファイル20個とGit履歴を変更前に保存した。元のリポジトリは無変更。GitHub連携は未接続なのでリポジトリ作成、push、Pages公開は未実施。

backup/original-v3.zipは元20ファイル（設定・画像・資料・テストを含む）、original-history.bundleはGit履歴。認証用Git設定、一時ファイル、個人のブラウザ内セーブは含まない。元ソースに未保存の差分がないことを確認した。

## 新規Privateリポジトリへの登録

1. github-project.zipを展開し、中のproject/を使う。
2. READMEの起動・チェックを実行する。
3. GitHubで未使用の名前の新規リポジトリを作成し、Privateにする。既存リポジトリは使わない。README、ライセンス、gitignoreの自動生成は選ばず空で作る。
4. project/から以下を実行。URLは作成した新しいPrivateリポジトリの実URLに置き換える。

~~~sh
git init -b main
git add .
git commit -m "Preserve MIDNIGHT CIRCUIT v3 for GitHub development"
git remote add origin <NEW_PRIVATE_REPOSITORY_URL>
git remote -v
git push -u origin main
~~~

このコピーには.gitや旧リモート接続情報は入っていない。.gitignoreも含めて登録する。認証は利用者のGitHub接続で行い、トークンをファイルやチャットへ貼り付けない。

ブラウザUpload filesでもproject/内の展開済みファイルが対象。ZIPを1個だけ置いても開発・配信はできない。バックアップや外側パッケージ全体を配信しない。

## Pages（次段階）

配信対象はdist/。リポジトリルートではなく、Actions方式などでdist/をPagesの公開アーティファクトに指定する。今回、自動デプロイ設定は追加しておらず、登録だけで自動公開されない。

2026-10-24にGitHub公式資料を確認した時点では、PrivateリポジトリのPages利用は契約プランに依存する。PrivateリポジトリでもPagesの閲覧は通常公開になる。ソース非公開とゲームの閲覧制限は別。ユーザーが公開を選ぶまで有効化せず、必要に応じ閲覧制限付きホスティングを選定する。

公式資料: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

相対参照なのでサブパス対応の構造だが、実際のPages URLでの確認は未実施。公開段階でMIME、404、スマートフォン、保存オリジンを確認する。

## 復元

ファイルだけならbackup/original-v3.zipを新しい空フォルダーへ展開。Git履歴付きの場合:

~~~sh
git clone backup/original-history.bundle restored-original
git -C restored-original rev-parse HEAD
~~~

期待HEADは655e9b5c91b349ff1fb2af380b019279a0e4573a。今回bundleからの復元を実行して確認している。復元コピーのoriginはローカルbundleのパス。旧.openai/hosting.jsonのSite IDを新規サイトに流用しない。

backup/source-manifest.jsonはファイルごとのSHA-256、外側のSHA256SUMS.txtは配布物の照合用。現在の作業を別途保存し、既存フォルダーへ上書き復元しない。

## セーブと継続開発

ブラウザのlocalStorageは移行先URLへ自動で引き継がれない。今回保存したのはソースと履歴で、ユーザー個々のプレイ記録は未取得。エクスポート/インポートは次段階。

新PrivateリポジトリをCodexに接続し、AGENTS.mdに従ってブランチで変更、テスト、差分レビューを行う。接続・CI実行・PR作成がこのパッケージ作成だけで完了したとは扱わない。
