# AttendSync - Attendance Management System

A modern, full-stack attendance management system built with React, Express, and MongoDB. Works seamlessly across all devices with responsive design.

## Features

- ✅ Student, Employee, and Admin portals
- ✅ Real-time attendance tracking
- ✅ MongoDB data persistence
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Holiday and semester management
- ✅ Leave approval workflow
- ✅ PF/CL tracking for employees
- ✅ Analytics and reports

## Project Structure

```
attendancemanagement/
├── backend/                 # Express.js server
│   ├── config/             # Database configuration
│   ├── models/             # MongoDB schemas
│   ├── controllers/        # Route handlers
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   ├── server.js           # Entry point
│   ├── package.json        # Dependencies
│   └── .env                # Configuration
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Dependencies
│   ├── vite.config.js     # Vite config
│   └── tailwind.config.js # Tailwind CSS config
└── README.md
```

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### Install Node.js
- Download from [nodejs.org](https://nodejs.org)
- Verify: `node --version` and `npm --version`

### MongoDB Setup

**Local MongoDB:**
1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Verify connection: `mongodb://127.0.0.1:27017/Attendsync`

**Cloud MongoDB (Atlas):**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Update `.env` in backend:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Attendsync
   ```

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd attendancemanagement
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### 3. Frontend Setup (in new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/Attendsync
```

For production:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Attendsync
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

### Students
- `POST /api/students/register` - Register new student
- `POST /api/students/login` - Login student
- `GET /api/students/all` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/attendance/:id` - Update attendance
- `DELETE /api/students/:id` - Delete student

### Employees
- `POST /api/employees/register` - Register new employee
- `POST /api/employees/login` - Login employee
- `GET /api/employees/all` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/attendance/:id` - Update attendance
- `PUT /api/employees/pfcl/:id` - Update PF/CL
- `DELETE /api/employees/:id` - Delete employee

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/students` - List students
- `GET /api/admin/employees` - List employees

### Holidays
- `POST /api/holidays/add` - Add holiday
- `GET /api/holidays/all` - Get all holidays
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

### Leave
- `POST /api/leaves/create` - Create leave request
- `GET /api/leaves/all` - Get all leaves
- `PUT /api/leaves/approve/:id` - Approve leave
- `PUT /api/leaves/reject/:id` - Reject leave

### Semester
- `POST /api/semester/save` - Save semester dates
- `GET /api/semester/current` - Get current semester

## Test Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Student (Auto-created on login)
- Name: Any name
- College: Any college
- Password: Any password

### Employee (Auto-created on login)
- Name: Any name
- Company: Any company
- Password: Any password

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy 'dist' folder
```

### Vercel (Recommended for Frontend)

1. In Vercel, create a new project and import this repository.
2. Set the root directory to the repository root — `vercel.json` is configured to build the frontend only.
3. Add environment variables in Vercel dashboard if your frontend requires any (e.g., `REACT_APP_API_URL` pointing to your backend).
4. Build command: `npm --prefix frontend run build`. Output directory: `frontend/dist`.

Note: This repository keeps the backend in `backend/` which is not configured for Vercel serverless deployment. Deploy the backend separately (e.g., Heroku, Railway, or a VPS) and then point the frontend API URL to that backend.


### Backend (Heroku/Railway)
```bash
# Set environment variables in platform dashboard
git push heroku main
```

### MongoDB Atlas
1. Create cluster in MongoDB Atlas
2. Get connection string
3. Add to `.env` as `MONGO_URI`

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Hooks
- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose
- **Authentication**: Session-based (LocalStorage)
- **Styling**: Tailwind CSS

## File Sizes

- Frontend build: ~264 KB (71.3 KB gzipped)
- Backend: Lightweight (~2 MB with node_modules)

## Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1920px and up)

## Troubleshooting

### "Invalid Credentials" on login
- Ensure backend server is running on port 5000
- Check MongoDB connection in `.env`
- Verify `MONGO_URI` points to correct database

### Frontend can't reach backend
- Make sure backend is running: `npm run dev` in backend folder
- Check if port 5000 is available
- Verify Vite proxy config in `vite.config.js`

### MongoDB connection fails
- Verify MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open Pull Request

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues or questions, create an issue in the repository.

---

**Made with ❤️ by AttendSync Team**
