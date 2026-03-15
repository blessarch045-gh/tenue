# tenue 次チャット引き継ぎメモ v2

## 最初にClaudeに伝えること

> tenuというiPhoneアプリを開発中です。
> このメモを読んで現在の状況を把握してください。

このドキュメントをアップロードして送信するだけでOKです。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| アプリ名 | tenue（テニュ／トゥニュ） |
| ジャンル | iPhoneアプリ（ファッションコーデ記録） |
| キャッチ | 服と、人と、その日を残す。 |
| 技術スタック | React Native + Expo (SDK 54) / TypeScript / Supabase |
| 開発体制 | 一人体制・Claude Pro使用 |
| AIツール | Chat / Cowork / Claude Code を併用 |

---

## 2. 完了済みの全作業

### Phase 0：環境構築 ✅
- 商標確認 → 9類・42類で問題なし、「tenue」確定
- GitHubアカウント作成（Googleアカウント連携）
- Homebrew / Node.js インストール
- Google Chrome インストール＋デフォルトブラウザ設定
- Supabaseアカウント＋プロジェクト作成（リージョン: Tokyo）
- Supabaseテーブル作成（profiles, coord_records）＋RLS＋Storageバケット
- Supabase メール確認オフ（開発用）
- サインアップ時のprofiles自動作成トリガー設定済み
- Expo Go iPhoneにインストール
- Expoプロジェクト作成（SDK 54）＋実機動作確認
- Claude Code インストール＋ログイン

### Phase 1：MVP開発 ✅
- プロジェクト基盤（フォルダ構成・colors.ts・types・supabase.ts・.env）
- 全6画面実装完了:
  - SplashScreen（ロゴ＋コピー → 2秒後にログインへ）
  - LoginScreen（メール＋パスワード認証）
  - SignUpScreen（メール＋パスワード＋確認）
  - HomeScreen（コーデ一覧グリッド＋FAB＋ログアウト）
  - AddCoordScreen（写真選択＋コメント＋保存）
  - CoordDetailScreen（写真大表示＋日付＋コメント＋削除）
- AppNavigator（認証状態による画面遷移）
- 実機動作確認済み（サインアップ・ログイン・写真保存・一覧・詳細・削除）

### MVP微調整 ✅
- 縦長写真対応（aspect比固定解除）
- 画像アップロード時の圧縮処理（quality 0.7・長辺1200px）
- 詳細画面の画像表示修復＋速度改善
- コメント入力欄のキーボード対応（KeyboardAvoidingView）

### マーケティング基盤 ✅
- Instagramアカウント開設（プロアカウント）
- Xアカウント開設
- 週次運用Cowork指示書v2作成（コンテンツ＋Gemini画像生成の自動化）
- 初期投稿「装いの記憶」9投稿 Coworkで作成済み
- Chrome＋Gemini環境整備

### プロジェクト管理 ✅
- CLAUDE.md秘書版（軽量）配置済み
- docs/技術設計.md / ブランド.md / マーケティング.md 分離配置済み

---

## 3. 未完了タスク（優先順）

| # | タスク | ツール | フェーズ |
|---|--------|--------|----------|
| 1 | Instagram初期投稿「装いの記憶」9投稿を3日間で実行 | 自分で | 今すぐ |
| 2 | Instagram週次運用開始（Cowork指示書v2で毎日1投稿） | Cowork | 今すぐ |
| 3 | Apple Developer Program登録（年99ドル） | ブラウザ | Phase 2 |
| 4 | βテスト（TestFlight配布＋フィードバック収集） | Xcode | Phase 2 |
| 5 | デザインブラッシュアップ（βフィードバック反映） | Claude Code | Phase 2 |
| 6 | App Store申請・公開 | ブラウザ | Phase 3 |
| 7 | マンガ第1話投稿（リリース告知と同時） | 自分で | Phase 3 |
| 8 | SVGロゴ正式版作成 | Claude Code | Phase 3 |

---

## 4. ファイルの場所

### プロジェクト本体
| ファイル | 場所 |
|---------|------|
| アプリソースコード | ~/Desktop/tenue/src/ |
| CLAUDE.md（秘書版） | ~/Desktop/tenue/CLAUDE.md |
| .env（Supabase接続情報） | ~/Desktop/tenue/.env |
| 技術設計 | ~/Desktop/tenue/docs/技術設計.md |
| ブランド設計 | ~/Desktop/tenue/docs/ブランド.md |
| マーケティング | ~/Desktop/tenue/docs/マーケティング.md |

### マーケティング資料
| ファイル | 場所 |
|---------|------|
| 週次運用指示書v2 | ~/Desktop/tenue/マーケティング/Instagram/ |
| 初期投稿コンテンツ＋画像 | ~/Desktop/tenue/マーケティング/Instagram/初期投稿/ |

### 参照ドキュメント
| ファイル | 内容 |
|---------|------|
| tenue_マスタードキュメントv2.docx | ブランド・技術設計・マーケ全情報の原本 |

---

## 5. 確定済み情報（変更不要）

### ブランド
| 項目 | 確定内容 |
|------|---------|
| アプリ名 | tenue（全小文字） |
| メインカラー | バーントオレンジ #BF5B30 |
| ベースカラー | アイボリー #F5F0E8 / クリームホワイト #FAF7F2 |
| フォント | Cormorant Garamond Light（ロゴ）/ Noto Sans JP（本文） |
| キャッチコピー | 服と、人と、その日を残す。 |

### 技術
| カテゴリ | 確定内容 |
|---------|---------|
| フレームワーク | React Native + Expo (SDK 54) / TypeScript |
| バックエンド | Supabase（認証・DB・Storage） |
| Storageバケット | tenue-photos |
| 画面数 | 6画面（固定） |

### マネタイズ
- MVP〜3ヶ月：完全無料
- SNSマネタイズ（ブランドタイアップ）を中期目標

### Instagram運用
- 開発の話はしない。ブランドの世界観を伝えることに集中
- 毎日1投稿（週次でCoworkが7日分を一括生成＋Gemini画像生成）
- マンガ投稿はアプリリリース時にダウンロードリンク付きで
- 投稿は手動（最後のボタンは自分で押す）

---

## 6. Claude Codeの使い方

Claude Codeは ~/Desktop/tenue/ で起動すると、CLAUDE.md を自動で読みます。

```
cd ~/Desktop/tenue && claude
```

- 「次何やる？」→ 優先タスクを教えてくれる
- 「○○を実装して」→ コードを自動生成
- 「○○のエラーを修正して」→ エラーメッセージを貼れば修正
- タスク完了時 → CLAUDE.mdを自動更新

CLAUDE.mdは軽量版（秘書版）。詳細は docs/ 内の各ファイルを必要な時だけ参照する設計です。

---

## 7. Coworkの使い方

### Instagram週次運用（毎週日曜）
~/Desktop/tenue/マーケティング/Instagram/ にある指示書v2の指示文をCoworkにコピペ → 7日分のコンテンツ＋画像が自動生成

### 毎日の投稿ルーティン（3分）
1. フォルダからその日のキャプション＋ハッシュタグを確認
2. 画像をiPhoneにAirDrop
3. Instagramで投稿

---

服と、人と、その日を残す。

— tenue 次チャット引き継ぎメモ v2
