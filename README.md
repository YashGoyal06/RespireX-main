# RespireX - AI-Powered Tuberculosis Detection System

## Overview

RespireX is an advanced healthcare platform that leverages artificial intelligence to provide preliminary tuberculosis (TB) screening through chest X-ray analysis. The system combines machine learning with symptom assessment to deliver quick, accurate preliminary results, making TB screening more accessible.

**Live Application:** [https://respirex.vercel.app](https://respirex.vercel.app)

## Features

### For Patients
- **AI-Powered X-Ray Analysis**: Upload chest X-rays for automated TB detection using EfficientNet-B0 deep learning model
- **Symptom Assessment**: Comprehensive questionnaire to evaluate TB-related symptoms
- **Instant Results**: Receive preliminary screening results with confidence scores and risk levels
- **Test History**: Track and review all previous screening tests
- **Downloadable Reports**: Generate and download detailed PDF reports of screening results
- **Secure Authentication**: Email/password and Google OAuth login options

### For Doctors
- **Patient Dashboard**: View and monitor all patient records across regions
- **State-wise Filtering**: Filter patient data by geographic location
- **Detailed Patient Profiles**: Access comprehensive patient information and test history
- **Report Generation**: Download official medical reports for patients
- **Secure Access**: Protected doctor registration with administrator access codes

## Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.11.0
- **Styling**: Tailwind CSS 3.4.0
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React 0.468.0
- **Authentication**: Supabase JS 2.89.0
- **Build Tool**: Vite 7.2.4

### Backend
- **Framework**: Django 5.0+ with Django REST Framework 3.14+
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage for X-ray images
- **Machine Learning**: TensorFlow 2.15+ with EfficientNet-B0
- **PDF Generation**: xhtml2pdf 0.2.15
- **Visualization**: Matplotlib 3.8+
- **Server**: Gunicorn with WhiteNoise

### Machine Learning
- **Model**: EfficientNet-B0 (pre-trained and fine-tuned)
- **Input Size**: 128x128 RGB images
- **Training Dataset**: TB chest X-ray dataset
- **Accuracy**: 98% on validation set

## Project Structure
```
RespireX/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Reusable components (Navbar, Footer, Loader)
│   │   │   └── pages/       # Page components
│   │   ├── lib/             # API and authentication utilities
│   │   └── App.jsx          # Main application component
│   └── public/              # Static assets
│
├── backend/                 # Django backend application
│   ├── api/
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API endpoints
│   │   ├── serializers.py   # Data serialization
│   │   ├── authentication.py # Supabase auth integration
│   │   ├── ml_engine.py     # ML model inference
│   │   ├── pdf_generator.py # Report generation
│   │   └── storage.py       # File upload handling
│   ├── model/
│   │   └── efficientnet_b0.h5 # Trained ML model
│   └── respirex_backend/
│       └── settings.py      # Django configuration
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 20+ and npm
- Python 3.10+
- PostgreSQL database (or Supabase account)
- Supabase account for authentication and storage

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_DOCTOR_ACCESS_CODE=your_secret_code
```

#### Backend (.env)
```env
SECRET_KEY=your_django_secret_key
DEBUG=False
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
DOCTOR_ACCESS_CODE=your_secret_code
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/profile/` - Create or update user profile
- `GET /api/profile/` - Retrieve current user profile

### Patient Endpoints
- `POST /api/predict/` - Upload X-ray and get TB prediction
- `GET /api/history/` - Retrieve patient's test history
- `GET /api/report/<id>/` - Download PDF report for specific test

### Doctor Endpoints
- `GET /api/doctor/dashboard/` - Retrieve patient records with filtering
- `GET /api/stats/` - Get public statistics (total tests completed)

## Machine Learning Model

The system uses EfficientNet-B0, a convolutional neural network optimized for efficiency and accuracy:

- **Architecture**: EfficientNet-B0 with transfer learning
- **Training**: Fine-tuned on TB chest X-ray dataset
- **Preprocessing**: Images resized to 128x128, normalized to [0,1]
- **Output**: Binary classification (Positive/Negative) with confidence score
- **Risk Assessment**: Calculated based on confidence and symptom correlation

## Security Features

- **Authentication**: JWT-based authentication via Supabase
- **Authorization**: Role-based access control (Patient/Doctor)
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Secure Storage**: X-ray images stored securely in Supabase Storage
- **Access Control**: Doctor registration requires administrator access code
- **CORS Protection**: Configured for production deployment

## Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy with automatic CI/CD

### Backend (Render/Railway)
1. Create new web service
2. Configure environment variables
3. Add build command: `pip install -r requirements.txt`
4. Add start command: `gunicorn respirex_backend.wsgi:application`

## Contributing

This project was developed by Team BitBash as part of the Atmanirbhar Bharat Mission to make healthcare more accessible.

## Disclaimer

RespireX is a preliminary screening tool and does not replace professional medical diagnosis. All users should consult qualified healthcare professionals for proper diagnosis and treatment. The AI-generated medication recommendations are for informational purposes only and should not be used without a prescription from a certified medical practitioner.

## License

Copyright 2025 RespireX by Team BitBash. All rights reserved.

## Support

For issues, questions, or contributions, please contact the development team through the repository's issue tracker.

---

**Note**: This is a healthcare screening tool designed to assist in early TB detection. Always consult healthcare professionals for medical advice and treatment.