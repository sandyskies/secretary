# 宝宝护理助手

一个使用 React Native (Expo) 开发的跨端移动应用，用于记录宝宝日常护理事件。

## 功能特性

- 🎙️ **语音记录** - 通过语音快速记录宝宝日常事件
- 📅 **日历视图** - 查看历史记录和事件时间线
- 📋 **事件列表** - 今天的喂奶、换尿布、拉屎拉尿等统计
- 🍼 **喂养记录** - 记录母乳（左/右侧）或奶瓶喂养
- 🛁 **洗澡记录**
- 💩 **便便记录**
- 💧 **尿尿记录**
- 👶 **换尿布记录**
- 😴 **睡觉记录**
- 💊 **喂药记录**
- 📝 **其他备注**

## 支持的语音指令

- 🍼 "宝宝喝奶了" / "左边喂奶" / "右侧吃奶"
- 🛁 "洗个澡" / "沐浴"
- 💩 "拉屎了" / "大便"
- 💧 "拉尿" / "尿尿"
- 👶 "换尿布" / "换纸尿裤"
- 😴 "睡觉了" / "哄睡"
- 💊 "吃药了" / "喂药"

## 技术栈

- **React Native (Expo)** - 跨端移动应用框架
- **TypeScript** - 类型安全
- **React Navigation** - 导航管理
- **AsyncStorage** - 本地数据持久化
- **react-native-calendars** - 日历组件
- **expo-av** - 音频录制
- **date-fns** - 日期处理

## 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行 Android
npm run android

# 运行 iOS (需要 macOS)
npm run ios

# 运行 Web
npm run web
```

## 项目结构

```
src/
├── components/       # 可复用组件
│   └── VoiceRecordButton.tsx
├── screens/          # 页面
│   ├── HomeScreen.tsx
│   ├── VoiceInputScreen.tsx
│   ├── CalendarScreen.tsx
│   └── EventsListScreen.tsx
├── navigation/       # 导航配置
│   └── AppNavigator.tsx
├── services/         # 业务逻辑服务
│   ├── eventStorage.ts
│   ├── voiceService.ts
│   └── voiceParser.ts
└── types/            # TypeScript 类型定义
    └── events.ts
```

## 未来计划

- [ ] 集成语音转文字服务
- [ ] 集成 trpc-agent-go 进行更智能的语音解析
- [ ] 添加数据导出功能
- [ ] 添加多宝宝支持
- [ ] 添加统计数据图表
- [ ] 云端数据同步
- [ ] 提醒功能

## 项目状态

✅ Kanban调度测试注释已更新为v4版本 (SYM-25)
