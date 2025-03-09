## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

### Clone the repository

```bash
git clone https://github.com/mushster/frontend-challenge-1.git
cd frontend-challenge-1
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# Or if you use yarn
yarn install
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
# Or if you use yarn
yarn install
```

## Running the Application

### Start the Backend Server

```bash
# In the backend directory
npm run dev
# Or if you use yarn
yarn dev
```

The backend server will start on http://localhost:8080.

### Start the Frontend Development Server

```bash
# In the frontend directory
npm run dev
# Or if you use yarn
yarn dev
```

The frontend development server will start on http://localhost:5173 which is Vite's default port.

## Usage

### Login
Use any username with the password "password" to log in.

### Claims Management
Upload a CSV file containing claims data, validate and modify claims as needed, then approve claims for MRF generation.

### MRF File Generation
Navigate to the MRF Files section, generate MRF files from approved claims, and download generated MRF files. The MRF files are stored locally and the page is publicly accessible.

## Troubleshooting

If you encounter issues connecting to the backend:

- Ensure the backend server is running on port 8080
- Check the console for any error messages
- Verify your network settings allow connections to localhost

## Development

### Project Structure

- /frontend - React frontend application
- /backend - Node.js backend API
- /docs - Documentation files