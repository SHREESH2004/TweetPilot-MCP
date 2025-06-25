
# 🤖 TweetPilot MCP — Your Automated Tweeting Agent

**MCP Server** is a powerful, lightweight server designed to automate tweeting on your behalf. Whether you want to schedule tweets, post updates programmatically, or integrate tweeting into your apps, MCP Server has you covered.

---

## 🚀 Features

- 🐦 **Automated Tweet Posting**: Schedule and send tweets effortlessly  
- 🔒 **Secure OAuth Authentication**: Safely connect your Twitter account  
- ⚙️ **RESTful API**: Easily integrate tweeting capabilities into any app  
- 🕒 **Custom Scheduling**: Post tweets at specific times or intervals  
- 📊 **Tweet Status Tracking**: Monitor success or failure of tweets  
- 🔄 **Retry Mechanism**: Automatic retries for failed tweet attempts

---

## 🛠️ Tech Stack

| Component       | Technology               |
|-----------------|--------------------------|
| Server          | Node.js, Express.js      |
| Twitter API     | Twitter API v2, OAuth 2.0|
| Scheduling      | node-cron                |
| Database (Opt.) | MongoDB (for tweet logs) |

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14+)  
- Twitter Developer Account with API keys & tokens  
- (Optional) MongoDB for logging

### Steps

1. **Clone the repo**

```bash
git clone https://github.com/yourusername/mcp-server.git
cd mcp-server
````

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file with the following variables:

```env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
PORT=3000
```

4. **Start the server**

```bash
npm start
```

---

## 🧩 Usage

### API Endpoints

| Method | Endpoint      | Description                  |
| ------ | ------------- | ---------------------------- |
| POST   | `/tweet`      | Post a new tweet immediately |
| POST   | `/schedule`   | Schedule a tweet for later   |
| GET    | `/status/:id` | Get status of a tweet by ID  |

### Example: Post a tweet immediately

```bash
curl -X POST http://localhost:3000/tweet \
-H "Content-Type: application/json" \
-d '{"message": "Hello world from MCP Server!"}'
```



## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

