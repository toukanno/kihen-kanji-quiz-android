# RELEASE.md — 木へん漢字クイズ テスト〜リリース手順

このドキュメントは、**木へん漢字クイズ**（Capacitor 6 + Vite + バニラ JS）の
動作テストから Android リリースビルド（APK / AAB）までの手順をまとめたものです。

---

## 0. 前提環境

| 項目 | 推奨 |
|------|------|
| Node.js | 18 以上（確認は 20.20.2） |
| JDK | 17（Android Studio 同梱 JBR でも可） |
| Android SDK | platform `android-34`, build-tools `34.0.0` 以上 |
| adb | platform-tools 同梱 |

環境変数の例（このワークスペースの WSL の場合）:

```bash
export JAVA_HOME="$HOME/.local/android-toolchain/jdk-17.0.2"
export ANDROID_HOME="$HOME/.local/android-toolchain/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

---

## 1. 依存インストール

```bash
npm install
```

成功条件：`node_modules/` が作成され、エラーなく完了すること。

---

## 2. 動作テスト（Web）

ロジック確認はブラウザが最速です。

```bash
npm run dev        # http://localhost:5173
# または
npm run build && npm run preview   # http://localhost:4173
```

手動テスト項目（クイズが最後まで遊べること）:

- [ ] ホームで出題数（10 / 20 / 全36問）を選んでスタートできる
- [ ] 選択肢をタップすると⭕❌と解説が出る
- [ ] 「次の問題へ」で最後まで進み、結果画面に到達する
- [ ] 結果画面にスコア・正答率・評価が出る
- [ ] 「もう一度プレイ」「ホームに戻る」が動く
- [ ] 問題順・選択肢順が毎回変わる（シャッフル）
- [ ] ダークモードの切替（🌙/☀️）が効く

---

## 3. Android プロジェクト準備

初回のみ：

```bash
npx cap add android
```

以降、Web を変更したら同期：

```bash
npm run build        # dist/ 更新
npx cap sync android # ネイティブへ反映
```

Gradle Sync の成功条件：`./gradlew tasks` がエラーなく一覧を出すこと。

---

## 4. デバッグ APK ビルド（テスト配布用）

```bash
npm run android:build:debug
# = vite build && cap sync android && cd android && ./gradlew assembleDebug
```

成果物：

```
android/app/build/outputs/apk/debug/app-debug.apk
```

端末/エミュレータへインストールして起動確認：

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.toukanno.kihenkanjiquiz -c android.intent.category.LAUNCHER 1
```

> WSL から Windows 側 adb を使う場合は `…/platform-tools/adb.exe` を Windows パスの
> APK 引数で呼び出してください（Linux 側 adb と Windows 側 adb サーバが競合する場合があるため）。

---

## 5. リリース署名鍵の作成（初回のみ）

```bash
keytool -genkey -v \
  -keystore kihen-release.keystore \
  -alias kihen \
  -keyalg RSA -keysize 2048 -validity 10000
```

`android/keystore.properties` を作成（**コミット禁止**、`.gitignore` 済み）:

```properties
storeFile=../kihen-release.keystore
storePassword=********
keyAlias=kihen
keyPassword=********
```

`android/app/build.gradle` の `signingConfigs` / `buildTypes.release` で
上記 `keystore.properties` を読み込むよう設定します（標準的な Capacitor 署名設定）。

---

## 6. リリース APK / AAB ビルド

```bash
# リリース APK（直接配布用）
npm run android:build:release
# 成果物: android/app/build/outputs/apk/release/app-release.apk

# AAB（Google Play 提出用）
npm run android:bundle:release
# 成果物: android/app/build/outputs/bundle/release/app-release.aab
```

署名未設定の場合は `app-release-unsigned.apk` が出力されます。`apksigner` で署名するか、
`keystore.properties` を設定して再ビルドしてください。

---

## 7. バージョン更新

リリースのたびに以下を更新します。

- `package.json` の `version`
- `android/app/build.gradle` の `versionCode`（整数、毎回 +1）と `versionName`（表示用）

---

## 8. Google Play 提出（任意）

1. [Play Console](https://play.google.com/console) でアプリを作成
2. `app-release.aab` を内部テストトラックにアップロード
3. ストア掲載情報・コンテンツレーティング・データセーフティを入力
4. 審査提出 → 公開

> 本アプリはネットワーク通信・個人情報収集を行わないため、データセーフティは
> 「データ収集なし」で申告できます（実装に変更がない前提）。

---

## 9. リリースチェックリスト

- [ ] `npm install` 成功
- [ ] `npm run build` 成功
- [ ] `npx cap sync android` 成功（Gradle Sync OK）
- [ ] デバッグ APK 生成・実機/エミュ起動・クイズ完走を確認
- [ ] `versionCode` / `versionName` を更新
- [ ] リリース署名で AAB を生成
- [ ] （配布する場合）Play Console へアップロード
