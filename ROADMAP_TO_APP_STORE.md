# 📱 FocusFlow 移动端 App 发布路线图 (Roadmap to App Store)

这是一个将 FocusFlow 网页版转化为真正的手机 App (iOS & Android) 并发布到应用商店的完整指南。

## 🚀 第一阶段：技术转型 (使用 Capacitor)

我们不需要重新写代码，可以使用 **Capacitor** 将现有的网页 "包装" 成一个原生 App。

### 1. 安装必要的工具
在项目根目录下运行以下命令（需要先安装 Node.js 环境）：

```bash
# 安装 Capacitor 核心库
npm install @capacitor/core @capacitor/cli

# 初始化 Capacitor (只需运行一次)
npx cap init FocusFlow com.example.focusflow --web-dir dist

# 安装 iOS 和 Android 平台支持
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### 2. 构建与同步
每次修改代码后，需要运行：

```bash
# 1. 构建网页版
npm run build

# 2. 同步到移动端项目
npx cap sync
```

### 3. 打开原生开发工具
- **iOS**: `npx cap open ios` (需要 Mac 电脑 + Xcode)
- **Android**: `npx cap open android` (需要 Android Studio)

---

## 💾 第二阶段：数据同步方案 (核心挑战)

目前 FocusFlow 使用**浏览器本地存储 (LocalStorage)**。在手机 App 中，这意味着：
- 电脑上的数据 **不会** 自动出现在手机 App 里。
- 卸载 App 后，数据可能会丢失。

**推荐解决方案：**

1.  **方案 A (最简单 - 单机版)**：
    - 接受电脑和手机数据不互通。
    - 手机主要作为随身记录工具。
    - **优点**：无需开发后端，成本为 0。
    - **缺点**：体验割裂。

2.  **方案 B (进阶 - 云同步)**：
    - 引入后端服务 (如 Firebase 或 Supabase)。
    - 用户登录账号后，数据保存到云端。
    - **优点**：真正的多端实时同步，数据安全。
    - **缺点**：开发难度大，需要学习后端知识。

---

## 🎨 第三阶段：移动端体验优化

网页在手机浏览器运行和在 App 中运行有一些区别，需要优化：

1.  **刘海屏适配 (Safe Area)**
    - 避免内容被手机顶部的刘海或底部的横条遮挡。
    - 需在 `index.html` 添加 `viewport-fit=cover`。
    - 使用 CSS 变量：`padding-top: env(safe-area-inset-top);`

2.  **触摸反馈**
    - 移除点击时的 300ms 延迟。
    - 增加按钮的点击态 (Active state)。

3.  **原生通知**
    - 目前的 `Notification` API 在 iOS App 中可能无法工作。
    - 需要使用 `@capacitor/local-notifications` 插件来替代。

---

## 🏪 第四阶段：上架发布 (Store Submission)

### 🍎 Apple App Store (iOS)
1.  **账号**：注册 [Apple Developer Program](https://developer.apple.com/programs/)。
    - **费用**：$99 / 年 (约 ¥699)。
2.  **硬件**：必须有一台 Mac 电脑来打包上传。
3.  **审核**：非常严格。App 不能只是一个简单的网页套壳，必须有原生体验（流畅、无明显 Bug）。

### 🤖 Google Play Store (Android)
1.  **账号**：注册 [Google Play Console](https://play.google.com/console)。
    - **费用**：$25 (一次性费用，约 ¥180)。
2.  **审核**：相对宽松，但近年来也在变严。

### 📦 国内安卓商店 (华为/小米/OPPO等)
1.  **账号**：每个商店都需要单独注册开发者账号（通常免费，但需要实名认证/企业资质）。
2.  **软件著作权**：国内上架通常需要提供《软件著作权证书》（申请周期约 1-3 个月）。

---

## ✅ 总结：下一步建议

如果您是个人开发者，建议按以下顺序进行：

1.  先完成 **Capacitor 集成**，在自己的手机上安装测试版玩玩（不需要上架）。
2.  如果觉得体验不错，尝试解决 **云同步** 问题（这是 App 的灵魂）。
3.  最后再考虑花费金钱和精力去 **申请账号和上架**。
