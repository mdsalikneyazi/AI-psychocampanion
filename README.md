# AI-psychocampanion
# Mitra - AI Psychological First-Aid Chatbot

**Mitra** (Sanskrit for "friend") is an AI-powered psychological first-aid chatbot that provides mental health support using Google's Gemini AI.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js + Express.js
- **AI**: Google Gemini 2.0 Flash API
- **Storage**: LocalStorage (no external data storage)

## 🎯 How It Works

### 1. AI Conversation System
- Uses **Google Gemini 2.0 Flash** for natural conversations
- **Trained with system instructions** for empathetic responses
- **Crisis detection** for self-harm/suicide ideation
- **Multilingual** (English/Hindi) support

### 2. Wellbeing Assessments
- **PHQ-2 + GAD-2**: Quick depression/anxiety screening (2-3 min)
- **PHQ-9**: Comprehensive depression assessment (5-7 min)  
- **GHQ-12**: General health distress screening (3-5 min)

### 3. Visual Score System
- **Color-coded progress bars** show assessment results:
  - 🟢 Green: Low risk
  - 🟡 Yellow: Mild risk
  - 🟠 Orange: Moderate risk
  - 🔴 Red: High risk
  - 🚨 Crisis: Immediate help needed

### 4. Crisis Intervention
- **Automatic detection** of crisis keywords
- **Immediate helpline** information (India: 9152987821)
- **Professional connection** options
- **Visual crisis alerts** with flashing indicators

## 📁 File Structure

```
chatbot/
├── app.js              # Frontend logic & assessments
├── server.js           # Express server + Gemini API
├── styles.css          # UI styling & animations
├── index.html          # Main HTML file
├── response_selector.js # AI response analysis
├── training_data.json  # AI training examples
└── package.json        # Dependencies
```

## 🔧 Key Features

### AI Training Methods
1. **System Instructions**: Detailed personality guidelines
2. **Few-Shot Learning**: Example conversations
3. **Context Analysis**: Dynamic response selection
4. **Crisis Detection**: Specialized emergency training


**Made with ❤️ for mental health awareness**

