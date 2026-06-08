# 木へん漢字クイズ 🌳

木へん（きへん）の漢字を学べる **4択クイズ形式の Android アプリ**です。
「読み」または「意味」から正しい木へんの漢字を選んでいきます。

- アプリ名：**木へん漢字クイズ**
- 形式：4択クイズ（読みから選ぶ / 意味から選ぶ）
- 収録問題数：**36問**（毎回シャッフルして出題）
- 技術構成：Vite + バニラ JavaScript を **Capacitor 6** で Android アプリ化

---

## 主な機能

| 機能 | 説明 |
|------|------|
| 4択クイズ | 1問につき4つの木へん漢字から正解を選ぶ |
| 2種類の出題形式 | 「読みから選ぶ」「意味から選ぶ」 |
| 正解・不正解表示 | 選択直後に⭕❌と解説を表示 |
| 正解数カウント | クイズ中・結果画面でスコアを表示 |
| 最終スコア表示 | 正解数・正答率・評価メッセージ |
| もう一度プレイ | 同じ問題数で再挑戦、またはホームへ戻る |
| 問題シャッフル | 出題のたびに問題順をランダム化 |
| 選択肢シャッフル | 各問題の選択肢の並びもランダム化 |
| 出題数の選択 | 10問 / 20問 / 全36問 から選べる |
| ダークモード | ライト/ダーク切替（端末設定に追従＋手動トグル、localStorage 保存） |

### 画面構成

1. **ホーム画面** — 出題数（10/20/全問）を選んでスタート
2. **クイズ画面** — 進捗バー・問題・4択ボタン・解説・次へ
3. **結果画面** — スコア・正答率・評価・もう一度プレイ/ホーム

---

## ディレクトリ構成

```
kihen-kanji-quiz-android/
├── index.html               # エントリ HTML
├── package.json
├── vite.config.js           # Vite 設定（base: './', 出力 dist/）
├── capacitor.config.json    # Capacitor 設定（appId / appName / webDir）
├── src/
│   ├── main.js              # アプリ本体（画面遷移・出題・採点ロジック）
│   ├── style.css            # スタイル（CSS変数でライト/ダーク対応）
│   └── data/
│       └── questions.json   # クイズデータ（36問）
├── android/                 # Capacitor が生成する Android プロジェクト
└── kihen-kanji-quiz-debug.apk  # ビルド済みデバッグ APK（動作確認用）
```

### クイズデータ形式（`src/data/questions.json`）

```json
[
  {
    "type": "reading",
    "question": "「さくら」を表す木へんの漢字は？",
    "choices": ["松", "桜", "梅", "桃"],
    "answer": "桜",
    "explanation": "桜（さくら）は春に淡いピンクの花を咲かせる木で、日本を代表する花です。"
  }
]
```

- `type`: `"reading"`（読みから）/ `"meaning"`（意味から）
- `choices`: 4つの選択肢（すべて木へんの漢字）
- `answer`: 正解（`choices` のいずれか）

問題を追加するには `questions.json` に同じ形式で要素を足すだけです。

---

## 開発・起動方法

### 必要環境

- Node.js 18 以上（動作確認は Node 20）
- Android ビルド用：JDK 17 + Android SDK（platform android-34, build-tools 34.0.0）
- 実機/エミュレータ確認用：adb

### 1. ブラウザで開発（最速の動作確認）

```bash
npm install
npm run dev
# 表示された http://localhost:5173 をブラウザで開く
```

### 2. Web ビルドの確認

```bash
npm run build      # dist/ に出力
npm run preview    # http://localhost:4173 で確認
```

### 3. Android APK をビルドして実機/エミュレータで起動

```bash
# JDK / SDK のパスを通す（環境に合わせて変更）
export JAVA_HOME="$HOME/.local/android-toolchain/jdk-17.0.2"
export ANDROID_HOME="$HOME/.local/android-toolchain/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# 初回のみ：Android プラットフォームを追加
npx cap add android

# Web ビルド → 同期 → デバッグ APK 生成
npm run android:build:debug
# 生成物: android/app/build/outputs/apk/debug/app-debug.apk

# 端末にインストールして起動
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.toukanno.kihenkanjiquiz -c android.intent.category.LAUNCHER 1
```

> Android Studio で開いて実行したい場合は `npx cap open android` を使います。

---

## アプリ情報

| 項目 | 値 |
|------|----|
| appId | `com.toukanno.kihenkanjiquiz` |
| appName | 木へん漢字クイズ |
| webDir | `dist` |
| Capacitor | 6.x |

---

## リリース手順

テストからリリース（APK / AAB 生成、署名）までの手順は **[RELEASE.md](RELEASE.md)** にまとめています。

## ライセンス

個人学習用プロジェクト。
