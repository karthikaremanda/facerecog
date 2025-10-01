# FaceRecog Project

A full-stack **face recognition application** built with React (frontend) and Python (backend), using advanced face recognition models. This project allows users to register faces, authenticate, and manage face data securely.

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, TypeScript
- **Backend:** Python, Flask/FastAPI
- **Machine Learning:** OpenCV, FaceNet (or your chosen model)
- **Database:** MongoDB / PostgreSQL
- **Other Tools:** Git, Docker (optional)

---

## 🚀 Features

- User registration and login
- Face registration and authentication
- Real-time face detection
- Group recognition from images
- Admin panel to manage users
- Optional: Intruder alerts (if unregistered faces detected)

---

## 📁 Folder Structure

face_recog/
├── backend/ # Python backend with API
├── frontend/ # React + Tailwind frontend
├── models/ # ML models / embeddings
├── data/ # Sample images / datasets
├── README.md
└── .gitignore


## 💻 Installation

1. **Clone the repo**
--bash
git clone https://github.com/yourusername/facerecog.git
cd facerecog

Backend setup

cd backend
pip install -r requirements.txt
python app.py


Frontend setup

cd ../frontend
npm install
npm run dev


The app should now run locally at http://localhost:5173 (or your configured port).

⚡ Usage

Register new users and faces

Upload images to test recognition

Admin can view all registered faces

Real-time authentication via webcam

📝 Notes

Make sure Python and Node.js are installed

Add your database URI and any secret keys in .env

Large model files should be downloaded separately if not included in repo

Optional: Add a screenshot or GIF of your app for better visualization

📜 License

This project is licensed under the MIT License - see the LICENSE
 file for details.

 ✨ Contributors-
   Aremanda karthik
