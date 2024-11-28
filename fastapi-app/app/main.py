from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .tasks import combine_videos
from .models import JobStatus 
from typing import List
import uuid
from .config import react_url,upload_dir, output_dir
import os


app = FastAPI()

os.makedirs(upload_dir, exist_ok=True)
os.makedirs(output_dir, exist_ok=True)

origins = [react_url]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

file_paths = []
file_names=[]

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    job_id = str(uuid.uuid4())

    for file in files:
        file_path =f"{upload_dir}/{file.filename}"
        file_paths.append(file_path)
        file_names.append(file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

    combine_videos.apply_async(args=[job_id, file_paths])

    return JSONResponse({"job_id": job_id})

@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    job_status = JobStatus.get_status(job_id)
    return JSONResponse(job_status)

@app.get("/download/{job_id}")
async def download(job_id: str):
    file_name = '_'.join(map(str, file_names))
    file_path = f"{output_dir}/{job_id}.mp4"
    response = FileResponse(file_path, media_type='application/octet-stream', filename=file_name)    
    response.headers["Content-Disposition"] = f"attachment; filename={file_name}"
    return response

