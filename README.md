# ReMat - An One Stop E-Waste Management Solution ♻️

<div align="center">

<img src="frontend/src/login-logo.png" alt="ReMat Logo" width="50%" />

**Turning E-Waste into Environmental Impact - Powered by AI**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange.svg)](https://www.tensorflow.org/)

</div>

---

### *Deployment*: https://re-mat.vercel.app

## 🌍 The Problem We're Solving

Electronic waste is one of the fastest-growing waste streams globally. India alone generates **3.2 million tonnes** of e-waste annually, with alarming consequences:

- **95% of e-waste** is handled by the informal sector without proper safety measures
- **Only 10-15%** of e-waste is properly recycled
- **Toxic materials** like lead, mercury, and cadmium contaminate soil and water
- **Zero visibility** into where citizens can dispose of e-waste responsibly
- **No incentive system** to encourage proper disposal

### Why This Happens

1. **Lack of Awareness**: Citizens don't know where to dispose of e-waste safely
2. **No Accessibility**: Recycling bins are scarce and hard to locate
3. **Zero Motivation**: No rewards or recognition for responsible disposal
4. **Manual Processes**: Recyclers rely on inefficient, labor-intensive sorting
5. **Fragmented System**: No unified platform connecting citizens, bins, and administrators

---

## 💡 Our Solution

**ReMat** is an AI-powered e-waste recycling platform that gamifies responsible disposal while connecting citizens, smart bins, and administrators in a seamless ecosystem.

### What Makes It Brilliant

#### 🤖 **AI-Powered Waste Classification**
- Deep learning model classifies 11 types of e-waste from photos
- **224×224 ResNet-style** image preprocessing for accuracy
- Confidence-based point allocation rewards quality submissions
- Real-time detection via `/user/detect-waste` endpoint
- Manual override option when AI misclassifies
- **Note**: In the deployment version, the `.tflite` format of the model has been used for inference, as the `.keras` format is too heavy for the free tier on `render.com`. If running locally, it is recommended to use the `.keras` format which can be downloaded from the Kaggle page under [ML Model](#ml-model). The model is to be placed under `backend/Models` and the code in `waste_temp.py` used for running it.

```python
# Real production inference - TensorFlow Keras / TfLite model
img = image.load_img(image_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = preprocess_input(np.expand_dims(img_array, axis=0))
predictions = model.predict(img_array)
# Returns: [Battery, Keyboard, Microwave, Mobile, Mouse, PCB, ...]
```

#### 🎯 **Smart Points & Gamification**
- **Confidence-based rewards**: High confidence (≥75%) = `base_points × confidence`
- **Medium confidence** (40-75%): `base_points × 0.6`
- **User override** triggers manual review with fixed points
- Real-time leaderboard with pagination
- Transaction history tracking every deposit
- Rewards system encourages continued participation

#### 📍 **Geospatial Bin Network**
- **PostGIS-powered** location storage using `POINT` geometry (SRID 4326)
- Find nearby bins with `ST_Distance` calculations
- **Fill-level monitoring**: Auto-alerts when bins reach 90% capacity
- Bin status tracking: `active` → `full` → `maintenance`
- Public kiosk screens at each bin with live fill levels and QR codes

#### 🚚 **Route Optimization for Admins**
- **OSRM integration** for optimized pickup routes
- Nearest-neighbor algorithm orders stops efficiently
- Real-time driving route geometry visualization
- Multi-bin selection for efficient collection
- **Haversine distance** calculations for accurate planning

```python
# Real production query - PostGIS geospatial search
SELECT id, name, capacity, fill_level,
  ST_Y(location::geometry) AS lat,
  ST_X(location::geometry) AS lng,
  ST_Distance(location::geography, 
    ST_MakePoint($lng, $lat)::geography
  ) AS distance_meters
FROM bins
WHERE status = 'active'
ORDER BY distance_meters ASC
LIMIT 10;
```

---

## 🏗️ Technical Architecture

### The Tech Stack

**Frontend**
- **React 19 + TypeScript** - Modern type-safe UI with latest React features
- **Vite 7** - Lightning-fast builds and hot module replacement
- **React Router 7** - Protected routes with role-based access control
- **Tailwind CSS 4** - Utility-first styling with dark mode support
- **Framer Motion & GSAP** - Smooth, production-quality animations
- **Leaflet / React-Leaflet** - Interactive maps for bin locations
- **html5-qrcode** - QR scanning for bin identification
- **react-qr-code** - QR code generation for kiosk displays

**Backend**
- **FastAPI** - High-performance async REST API
- **SQLAlchemy 2** - Modern ORM with async support
- **PostgreSQL + PostGIS** - Geospatial database for location queries
- **GeoAlchemy2** - Geospatial column types and queries
- **TensorFlow / Keras** - Deep learning for e-waste classification
- **Pydantic** - Request/response validation with type hints

**Authentication & Services**
- **Firebase Auth** - Email/password + Google social login
- **Firebase Admin SDK** - JWT verification on backend
- **Supabase Storage** - Pickup request image hosting
- **OSRM** - Open-source routing machine for route optimization

### System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              React Frontend (TypeScript)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Users   │  │  Admins  │  │   Bins   │  │   Auth   │    │
│  │Dashboard │  │Dashboard │  │  Kiosk   │  │Login/Reg │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       └─────────────┴──────────────┴─────────────┘          │
└───────────────────────┬──────────────────────────────────────┘
                        │
         ┌──────────────▼──────────────┐
         │   FastAPI REST API          │
         │  (JWT Auth Middleware)      │
         └──────────────┬──────────────┘
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
┌─────▼─────┐  ┌────────▼────────┐  ┌────▼─────┐
│PostgreSQL │  │  TensorFlow     │  │ Firebase │
│  PostGIS  │  │  Keras Model    │  │   Auth   │
│ Geography │  │ (E-waste Class) │  │   JWT    │
└───────────┘  └─────────────────┘  └──────────┘
      │                 │                 │
      │        ┌────────▼────────┐        │
      └───────►│  Supabase       │◄───────┘
               │   Storage       │
               │ (Pickup Images) │
               └─────────────────┘
```

### Key Technical Decisions

#### 1. **AI-First Waste Detection**

Our TensorFlow Keras model is the heart of the platform:

```python
# Backend inference pipeline
class WasteDetector:
    def __init__(self, model_path: str):
        self.model = load_model(model_path)
        self.classes = ['Battery', 'Keyboard', 'Microwave', 'Mobile', 
                       'Mouse', 'PCB', 'Player', 'Printer', 'Television', 
                       'Washing Machine', 'Laptop']
    
    def detect(self, image_path: str):
        img = image.load_img(image_path, target_size=(224, 224))
        img_array = preprocess_input(np.expand_dims(
            image.img_to_array(img), axis=0
        ))
        predictions = self.model.predict(img_array)[0]
        
        return {
            'waste_type': self.classes[np.argmax(predictions)],
            'confidence': float(np.max(predictions)),
            'all_predictions': dict(zip(self.classes, predictions))
        }
```

**Why?**
- Eliminates manual waste sorting overhead
- Scales to thousands of deposits per day
- Improves with more training data over time
- Provides educational value to users

#### 2. **Confidence-Based Point Allocation**

Points adapt to detection accuracy:

```python
def calculate_points(waste_type: str, confidence: float, 
                    user_override: bool) -> int:
    base_points = POINTS_MAP[waste_type]
    
    if user_override:
        return MANUAL_OVERRIDE_POINTS[waste_type]
    elif confidence >= 0.75:
        return int(base_points * confidence)
    elif confidence >= 0.40:
        return int(base_points * 0.6)
    else:
        return MANUAL_OVERRIDE_POINTS[waste_type]
```

**Why?**
- Rewards high-quality submissions
- Prevents gaming the system with unclear photos
- Maintains trust through manual override fallback
- Balances automation with human judgment

#### 3. **PostGIS for Geospatial Intelligence**

Geography columns enable powerful spatial queries:

```python
# SQLAlchemy model with GeoAlchemy2
class Bin(Base):
    __tablename__ = 'bins'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    location = Column(Geography(geometry_type='POINT', srid=4326))
    capacity = Column(Integer, default=100)
    fill_level = Column(Integer, default=0)
    status = Column(Enum(BinStatus), default=BinStatus.ACTIVE)

# Query: Find bins within radius
nearby_bins = db.query(Bin).filter(
    func.ST_DWithin(
        Bin.location,
        func.ST_MakePoint(lng, lat),
        radius_meters,
        True  # Use geography for spherical calculations
    )
).all()
```

**Why?**
- Accurate distance calculations on Earth's surface
- Efficient spatial indexing for fast lookups
- Industry-standard approach used by Uber, DoorDash, etc.
- Enables future features like service area polygons

#### 4. **Multi-Tenant Role System**

Single unified platform serves different user types:

```python
# JWT verification + role extraction
async def verify_firebase_token(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace('Bearer ', '')
    decoded = firebase_admin.auth.verify_id_token(token)
    
    user = db.query(User).filter(User.uid == decoded['uid']).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user  # Contains role: 'user' or 'admin'
```

**Frontend Protected Routes:**
```typescript
// Different dashboards based on role
<Route path="/user/*" element={
  <ProtectedRoute allowedRoles={['user']}>
    <UserLayout />
  </ProtectedRoute>
} />

<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminLayout />
  </ProtectedRoute>
} />
```

**Why?**
- Single authentication system for all users
- Clear separation of concerns
- Secure role-based access control
- Easy to add new roles (e.g., 'collector', 'verifier')

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, Python 3.10+, PostgreSQL 14+ with PostGIS
- Firebase account, Supabase account (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ReMat

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
mkdir -p uploads/waste_images

# Configure environment
# 1. Firebase Admin: either add backend/serviceAccountKey.json (keep in .gitignore)
#    OR set FIREBASE_SERVICE_ACCOUNT_JSON in backend/.env to the full JSON string (for production/CI)
# 2. Create backend/.env with database and API credentials

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend setup (new terminal)
cd frontend
npm install

# Configure frontend/.env with Firebase config
npm run dev
```

### Database Setup

```sql
CREATE DATABASE remat;
\c remat
CREATE EXTENSION postgis;
```

### Admin Credentials

```
email: admin@remat.com
passoword: rematadmin
```

### ML Model

Here is the training of the ML model used: [Kaggle](https://www.kaggle.com/code/saiswaroop8656/remat)

---

## ✨ Key Features

### For Users (Citizens) ♻️
- **Authentication**: Email/password or Google sign-in via Firebase
- **Smart Recycling**: Scan bin QR → capture photo → AI classifies → earn points
- **Pickup Requests**: Schedule large item collection with photo, location, and time
- **Gamification**: Real-time leaderboard, points tracking, and rewards
- **Transaction History**: Complete audit trail of all deposits
- **Profile Management**: View stats, recent activity, and account settings

### For Admins 🛠️
- **Bin Management**: Add, edit, delete bins with location, capacity, and status
- **Fill Monitoring**: Real-time alerts when bins reach 90% capacity
- **Pickup Queue**: Review, accept, or reject user pickup requests
- **Route Optimization**: Generate efficient collection routes with OSRM
- **Analytics Dashboard**: Overview of system health and performance
- **Points Control**: Set reward amounts when accepting pickup requests

### For Bin Kiosks 📺
- **Public Display**: Show bin name, fill level, capacity at `/bin/:binId`
- **QR Code**: Generate scannable code for users to start recycling
- **Live Updates**: Real-time fill level visualization
- **Status Indicators**: Visual feedback on bin operational status

---

## 🎯 Technical Highlights

### AI & Machine Learning
- **11-class e-waste classifier** trained on custom dataset
- **ResNet-style preprocessing** for optimal accuracy
- **Confidence thresholds** prevent false positives
- **Model versioning** ready for continuous improvement
- **Training pipeline** documented in Kaggle notebook

### Geospatial Intelligence  
- **PostGIS geography type** for accurate Earth-surface calculations
- **Spatial indexing** enables sub-100ms nearby queries
- **OSRM integration** for real-world driving routes
- **Haversine distance** for initial proximity sorting
- **Future-ready** for service area polygons and geofencing

### Real-Time Performance
- **FastAPI async handlers** for concurrent requests
- **Connection pooling** optimizes database access
- **Lazy loading** for images and heavy resources
- **Progressive image upload** with Supabase CDN
- **Optimistic UI updates** for instant feedback

### Data Integrity
- **ACID transactions** for critical operations (points, deposits)
- **Foreign key constraints** maintain referential integrity
- **Enum types** for validated status fields
- **UUID primary keys** prevent collision in distributed systems
- **Cascading deletes** keep data consistent

---

## 📋 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register user (Firebase token + name) |
| POST | `/auth/login` | Login (Firebase token) |
| GET | `/auth/me` | Current user profile |
| DELETE | `/auth/me` | Delete account |

### User Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/me` | User by ID (query param) |
| POST | `/user/detect-waste` | Upload image → AI classification |
| PUT | `/user/recycle/{binid}` | Confirm deposit and earn points |
| GET | `/user/transactions/{user_id}` | Paginated transaction history |
| GET | `/user/leaderboard` | Top users by points |

### Bins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bins/` | List all bins with coordinates |
| GET | `/api/bins/{bin_id}` | Bin details by ID |
| GET | `/api/bins/nearby` | Find bins near lat/lng |
| POST | `/api/bins/` | Create bin (admin only) |
| PUT | `/api/bins/{bin_id}` | Update bin |
| DELETE | `/api/bins/{bin_id}` | Delete bin |

### Pickup Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/pickup-requests` | My requests |
| POST | `/user/pickup-requests` | Create request (multipart) |
| PATCH | `/user/pickup-requests/{id}/location` | Update location |
| DELETE | `/user/pickup-requests/{id}` | Delete (open only) |
| GET | `/admin/pickup-requests` | All requests (admin) |
| PATCH | `/admin/pickup-requests/{id}/accept` | Accept with points |
| PATCH | `/admin/pickup-requests/{id}/reject` | Reject request |

### Route Optimization
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/route/optimize` | Generate optimized route |

### Bin Kiosk
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bin/panel/{bin_id}` | Public bin display data |
| POST | `/bin/panel/{bin_id}/confirm` | Kiosk deposit confirmation |

**All protected routes require:** `Authorization: Bearer <Firebase ID token>`

---

## 🤖 ML Model Details

### E-Waste Classifier

**Architecture:**
- Base: ResNet-style CNN architecture
- Input: 224×224 RGB images
- Output: 11 classes with softmax probabilities
- Preprocessing: `keras.applications.resnet.preprocess_input`

**Classes:**
1. Battery
2. Keyboard
3. Microwave
4. Mobile
5. Mouse
6. PCB (Printed Circuit Board)
7. Player (Media player)
8. Printer
9. Television
10. Washing Machine
11. Laptop

**Training:**
- Dataset: Custom e-waste image collection
- Augmentation: Rotation, flip, zoom, brightness
- Validation split: 20%
- Early stopping + model checkpointing
- **Full training notebook:** [ReMat on Kaggle](https://www.kaggle.com/code/saiswaroop8656/remat)

**Production Inference:**
```python
# Load model once at startup
model = load_model('backend/Models/ewaste_final.keras')

# Inference per request
img = image.load_img(path, target_size=(224, 224))
img_array = preprocess_input(
    np.expand_dims(image.img_to_array(img), axis=0)
)
predictions = model.predict(img_array)[0]

result = {
    'class': classes[np.argmax(predictions)],
    'confidence': float(np.max(predictions)),
    'all_probabilities': dict(zip(classes, predictions))
}
```

---

## 🤝 Contributing

We welcome contributions! 

1. Fork the repo
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📞 Contact

- **Email**: remat.project123@gmail.com

---

<div align="center">

**Made with ❤️ for a greener planet**

Every device recycled counts. Every action matters. Together, we can tackle e-waste responsibly.

⭐ **Star us on GitHub** if you believe in our mission!

</div>
<div align="center">
  This project was made for Haxplore, Codefest '26.
</div>
