# Stage 1: Build React frontend
FROM node:18 AS build-frontend

# Set working directory for the React app
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --force

ENV REACT_APP_BACKEND_API_URL /api

# Copy the rest of the frontend files, excluding the ignored ones
COPY frontend/ .

# Build the React app
RUN npm run build

# Stage 2: Set up Flask backend
FROM python:3.11-alpine AS build-backend

# Set working directory for the Flask app
WORKDIR /app/backend

# Copy requirements file and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --upgrade Flask Werkzeug

# Copy the rest of the backend files, excluding the ignored ones
COPY backend/ .

# Copy the built React app from the first stage
COPY --from=build-frontend /app/frontend/build /app/backend/static

EXPOSE 5000

# Set environment variable for Flask to run in production
ENV FLASK_ENV=production

# Start the backend
CMD ["python", "app.py"]
