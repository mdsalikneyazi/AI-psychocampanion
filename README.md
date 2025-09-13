# AI-psychocampanion
# Mitra - AI Psychological First-Aid Chatbot

**Mitra** (Sanskrit for "friend") is an AI-powered psychological first-aid chatbot that provides mental health support using Google's Gemini AI.

## 🚀 Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your Gemini API key**
   ```bash
   echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open** `http://localhost:3000`

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

### Assessment Flow
```
User agrees → Choose assessment → Answer questions → Get color-coded score → Recommendations
```

### Crisis Flow
```
Crisis detected → Visual alerts → Helpline info → Professional connection
```

## 🚨 Crisis Resources

- **India Helpline**: 9152987821 / 1800-599-0019
- **Emergency**: 100 (Police) / 108 (Ambulance)
- **US Crisis Line**: 988

## 🔒 Privacy

- **No data storage** on external servers
- **Local processing** only
- **Conversation history** stored in browser
- **GDPR compliant**

## 🎨 Customization

### Adding New Assessments
1. Add questions to arrays in `app.js`
2. Create scoring function
3. Add color bar integration

### Modifying AI Responses
1. Edit system instructions in `server.js`
2. Add examples to examples array
3. Update response selector logic

## 📊 API Endpoints

- `POST /api/chat` - Send messages to AI
- `GET /health` - Server health check

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure CORS for your domain
3. Use HTTPS in production
4. Add rate limiting if needed

---

**Made with ❤️ for mental health awareness**

