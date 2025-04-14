# Abnormal File Vault

A full-stack file management application built with React and Django, designed for efficient file handling and storage with built-in deduplication and intelligent search capabilities.

## 🚀 Technology Stack

### Backend
- Django 4.x (Python web framework)
- Django REST Framework (API development)
- SQLite (Development database)
- Gunicorn (WSGI HTTP Server)
- WhiteNoise (Static file serving)

### Frontend
- React 18 with TypeScript
- TanStack Query (React Query) for data fetching
- Axios for API communication
- Tailwind CSS for styling
- Heroicons for UI elements

### Infrastructure
- Docker and Docker Compose
- Local file storage with volume mounting

## 📋 Key Features

### File Deduplication System
- Identifies duplicate files at upload time using content hashing
- Stores only unique files while maintaining references for duplicates
- Displays storage efficiency metrics and space savings
- Visual indicators for duplicate files

### Search & Filtering System
- Search files by filename
- Filter files by:
  - File type (with dynamically generated options)
  - Size range (predefined options like small, medium, large)
  - Upload date (custom date range selection)
- Multiple filters can be applied simultaneously
- Visual indicators for active filters

## 🛠️ Installation & Setup

### Using Docker (Recommended)

```bash
docker-compose up --build
```

### Local Development Setup

#### Backend Setup
1. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create necessary directories**
   ```bash
   mkdir -p media staticfiles data
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup
1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**
   Create `.env.local`:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🌐 Accessing the Application

- Frontend Application: http://localhost:3000
- Backend API: http://localhost:8000/api

## 📝 API Documentation

### File Management Endpoints

#### List Files
- **GET** `/api/files/`
- Returns a list of all uploaded files
- Response includes file metadata (name, size, type, upload date)
- Supports filtering via query parameters:
  - `filename`: Search by filename (case-insensitive)
  - `file_type`: Filter by file type
  - `min_size`: Minimum file size in bytes
  - `max_size`: Maximum file size in bytes
  - `date_from`: Filter files uploaded on or after this date (YYYY-MM-DD)
  - `date_to`: Filter files uploaded on or before this date (YYYY-MM-DD)

#### Upload File
- **POST** `/api/files/`
- Upload a new file
- Request: Multipart form data with 'file' field
- Returns: File metadata including ID, upload status, and deduplication info

#### Get File Details
- **GET** `/api/files/<file_id>/`
- Retrieve details of a specific file
- Returns: Complete file metadata

#### Delete File
- **DELETE** `/api/files/<file_id>/`
- Remove a file from the system
- Returns: 204 No Content on success

#### Get File Types
- **GET** `/api/files/file_types/`
- Returns a list of all unique file types in the system
- Used for populating the file type filter options

#### Get Storage Statistics
- **GET** `/api/files/storage_stats/`
- Returns statistics about storage efficiency
- Includes:
  - Total files count
  - Unique files count
  - Duplicate files count
  - Total size of all files
  - Actual storage used
  - Storage saved through deduplication
  - Efficiency percentage

#### Download File
- Access file directly through the file URL provided in metadata

## 🗄️ Project Structure

```
file-vault/
├── backend/                # Django backend
│   ├── files/             # Main application
│   │   ├── models.py      # Data models
│   │   ├── views.py       # API views
│   │   ├── urls.py        # URL routing
│   │   └── serializers.py # Data serialization
│   ├── core/              # Project settings
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json      # Node.js dependencies
└── docker-compose.yml    # Docker composition
```

## 🔧 Development Features

- Hot reloading for both frontend and backend
- React Query DevTools for debugging data fetching
- TypeScript for better development experience
- Tailwind CSS for rapid UI development

## 🐛 Troubleshooting

1. **Port Conflicts**
   ```bash
   # If ports 3000 or 8000 are in use, modify docker-compose.yml or use:
   # Frontend: npm start -- --port 3001
   # Backend: python manage.py runserver 8001
   ```

2. **File Upload Issues**
   - Maximum file size: 10MB
   - Ensure proper permissions on media directory
   - Check network tab for detailed error messages

3. **Database Issues**
   ```bash
   # Reset database
   rm backend/data/db.sqlite3
   python manage.py migrate
   ```

4. **Data directory permissions**
   ```bash
   # If you encounter database access issues
   mkdir -p backend/data
   chmod 755 backend/data
   ```

# Project Submission Instructions

## Preparing Your Submission

1. Before creating your submission zip file, ensure:
   - All features are implemented and working as expected
   - All tests are passing
   - The application runs successfully locally
   - Remove any unnecessary files or dependencies
   - Clean up any debug/console logs

2. Create the submission zip file:
   ```bash
   # Activate your backend virtual environment first
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Run the submission script from the project root
   cd ..
   python create_submission_zip.py
   ```

   The script will:
   - Create a zip file named `username_YYYYMMDD.zip` (e.g., `johndoe_20240224.zip`)
   - Respect .gitignore rules to exclude unnecessary files
   - Preserve file timestamps
   - Show you a list of included files and total size
   - Warn you if the zip is unusually large

3. Verify your submission zip file:
   - Extract the zip file to a new directory
   - Ensure all necessary files are included
   - Verify that no unnecessary files (like node_modules, __pycache__, etc.) are included
   - Test the application from the extracted files to ensure everything works

## Video Documentation Requirement

**Video Guidance** - Record a screen share demonstrating:
- How you leveraged Gen AI to help build the features
- Your prompting techniques and strategies
- Any challenges you faced and how you overcame them
- Your thought process in using AI effectively

**IMPORTANT**: Please do not provide a demo of the application functionality. Focus only on your Gen AI usage and approach.

## Submission Process

1. Submit your project through this Google Form:
   [Project Submission Form](https://forms.gle/nr6DZAX3nv6r7bru9)

2. The form will require:
   - Your project zip file (named `username_YYYYMMDD.zip`)
   - Your video documentation
   - Any additional notes or comments about your implementation

Make sure to test the zip file and video before submitting to ensure they are complete and working as expected.