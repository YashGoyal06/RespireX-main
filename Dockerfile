# Place this file in the ROOT of your project (next to frontend/ and backend/ folders)

# 1. Use Python 3.9
FROM python:3.10-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Hugging Face Spaces expose port 7860 by default
ENV PORT 7860 

# 3. Set work directory
WORKDIR /app

# 4. Install system dependencies (required for some Python packages)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python dependencies
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the backend code
COPY backend/ /app/

# 7. Collect static files (for Django Admin styles)
RUN python manage.py collectstatic --noinput

# 8. Run the application using Gunicorn
# Note: We bind to 0.0.0.0:7860 as required by Hugging Face
CMD ["gunicorn", "respirex_backend.wsgi:application", "--bind", "0.0.0.0:7860"]