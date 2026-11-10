# Azure Network Basics

Azureを題材に、ネットワーク・インフラ未経験者が基本用語の役割と関係を学べる、外部依存なしの静的Web教材です。

## Target audience

- アプリケーション開発経験があり、ネットワークはこれから学ぶ人
- Azureのネットワーク関連用語を調べる前に、基礎的な見取り図を作りたい人

## Lessons

1. Network
2. IP Address & Subnet
3. Gateway & Routing
4. DNS, Port & HTTP
5. Firewall & NSG
6. Azure Network Challenge

各レッスンには、身近な例、用語解説、HTML/CSSの構成図、Azureとの関連、4択Quiz、完了解除・記録があります。進捗はブラウザの`localStorage`に保存されます。

## Run locally

このリポジトリをダウンロードまたはcloneし、`index.html`をブラウザで直接開いてください。ビルド、Node.js、npm、サーバは不要です。

## Publish with GitHub Pages

1. GitHubでこのリポジトリをPublicとしてpushします。
2. リポジトリの **Settings** → **Pages** を開きます。
3. **Build and deployment** のSourceで **Deploy from a branch** を選びます。
4. Branchに`main`、Folderに`/(root)`を指定して保存します。
5. 表示されたGitHub PagesのURLを開きます。

すべて相対パスで参照しているため、プロジェクトページのサブディレクトリ配信でも利用できます。

## Technology stack

- HTML5
- CSS3
- Vanilla JavaScript
- browser localStorage

外部フレームワーク、CDN、バックエンド、認証機能は使用していません。

## Public repository note

本教材のIPアドレスと構成はすべて学習用の一般化した例であり、実在する企業・環境・認証情報を含みません。
