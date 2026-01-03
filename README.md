# 💜 Romantic Quiz - How Well Do You Know Each Other?

A fun and interactive couple quiz application where you and your partner can test how well you know each other!

## 🎯 Features

- 💑 **Two-player quiz system** - Create questions and guess each other's answers
- 🎨 **Beautiful purple-themed UI** with playful animations and hover effects
- 📊 **Compatibility score** tracking
- ✨ **Interactive design** with smooth transitions and engaging elements
- 🔐 **User authentication** system
- 📱 **Responsive design** for all devices

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **Sequelize ORM** - Database management
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **React Icons** - Icon library

## 📁 Project Structure

```
puf3/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/         # Database models
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth middleware
│   ├── database.js     # Sequelize connection
│   ├── index.js        # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── context/        # Auth context
    │   ├── api.js         # Axios instance
    │   ├── App.jsx        # Main app
    │   └── main.jsx       # Entry point
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create MySQL database:
```sql
CREATE DATABASE romantic_quiz;
```

4. Configure environment variables in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=romantic_quiz
JWT_SECRET=your_super_secret_jwt_key
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎮 How to Use

1. **Register** - Create accounts for both you and your partner
2. **Create Questions** - Ask fun questions with your answer as the key
3. **Answer Questions** - Try to guess your partner's answers
4. **View Results** - See who knows who better with compatibility scores!

### Question Examples:
- What's my favorite color?
- What food do I hate?
- Where do I want to travel?
- What's my favorite memory with you?
- What do I order most at restaurants?

## 🎨 Features Highlights

- **Animated backgrounds** with floating hearts
- **Smooth hover effects** on all interactive elements
- **Color-coded status badges** (waiting/completed/correct/incorrect)
- **Real-time statistics** showing compatibility score
- **Beautiful gradient buttons** with purple and pink theme
- **Responsive cards** with shadow and scale effects

## 📊 Database Schema

### Users Table
- id, username, password, displayName, createdAt, updatedAt

### Questions Table
- id, creatorId, questionText, creatorAnswer, status, createdAt, updatedAt

### Answers Table
- id, questionId, userId, answerText, isCorrect, createdAt, updatedAt

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- Input validation
- SQL injection prevention (Sequelize ORM)

## 🎯 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Questions
- `POST /api/questions` - Create question
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get question by ID
- `DELETE /api/questions/:id` - Delete question

### Answers
- `POST /api/answers` - Submit answer
- `GET /api/answers/statistics` - Get user statistics

## 🎨 Color Palette

- **Primary Purple**: `#a855f7` to `#581c87`
- **Romantic Pink**: `#ff6b9d` to `#ec4899`
- **Accent Colors**: Yellow, Green, Indigo for status indicators

## 💡 Tips for Best Experience

1. Be creative with your questions!
2. Use playful and fun language
3. Try questions about preferences, memories, and habits
4. Check the statistics to see your compatibility score
5. Have fun and learn more about each other! 💜

## 🐛 Troubleshooting

- Make sure MySQL is running
- Check `.env` file configuration
- Ensure ports 3000 and 5000 are available
- Clear browser cache if experiencing issues

## 📝 License

This project is created for personal/educational use.

---

Made with 💜 for couples who want to have fun and know each other better!
