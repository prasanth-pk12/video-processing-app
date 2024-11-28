# Video Processor App

A scalable video processing application built with **FastAPI**, **React**, and **Celery**. The app combines multiple videos into one and uses **Redis** as a message broker for task management. It also provides a **Flower** dashboard for monitoring Celery tasks.


---

## Features

- **Backend**: FastAPI for handling API requests.
- **Frontend**: React for an interactive user interface.
- **Task Processing**: Celery for handling long-running tasks.
- **Message Broker**: Redis for managing task queues.
- **Task Monitoring**: Flower for visualizing Celery tasks.

---

## Prerequisites

Ensure you have the following installed:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/video-processor.git
cd video-processor 
```

### 2. Build and Run Services

Run the following command to build and start all services:

```bash
docker-compose up --build
```

### 3. Access the Application
- Frontend (React): http://localhost:3000
- Backend (FastAPI): http://localhost:8001
- Task Monitoring (Flower): http://localhost:5555


## Services Overview
### 1. FastAPI (Backend)
- Handles API endpoints for the video processor app.
- Runs on port 8001.

### 2. ReactJS (Frontend)
- Provides an interactive UI for uploading and managing video processing tasks.
- Runs on port 3000.

### 3. Celery
- Executes long-running video processing tasks in the background.
- Uses Redis as the message broker.

### 4. Redis
- Acts as the message broker for Celery.
- Runs on port 6379.

### 5. Flower
- A web-based monitoring tool for Celery tasks.
- Runs on port 5555.


## How to Stop Services
To stop all running services, use:

```bash
docker-compose down
```

## Troubleshooting

### 1. Docker Build Issues:

- Ensure Docker and Docker Compose are installed and running.
- Run docker system prune to clean up unused Docker resources.

### 2. Redis Connection Errors:

- Verify that the Redis container is running on port 6379.
- Check the logs for the redis service using:
```bash
docker-compose logs redis
```

### 3. Celery Task Failures:

- Check the Celery worker logs:
```bash
docker-compose logs celery
```

### 4. Flower Dashboard Not Loading:
- Ensure the flower service is running and accessible at http://localhost:5555.