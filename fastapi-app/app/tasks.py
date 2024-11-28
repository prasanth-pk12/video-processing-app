from celery import Celery
import ffmpeg
import logging
from .models import JobStatus
from .config import redis_url,output_dir
import tempfile
import os

celery = Celery(__name__, broker=redis_url, backend=redis_url)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    handlers=[logging.StreamHandler()])

@celery.task
def combine_videos(job_id, file_paths):
    output_path = f"{output_dir}/{job_id}.mp4"
    logging.info(f"Starting to combine videos for job_id: {job_id} with files: {file_paths} test: {os.path.abspath('../data/upload')}")
    try:
        with tempfile.NamedTemporaryFile(mode='w', delete=False, dir=output_dir) as filelist:
            for file_path in file_paths:
                filelist.write(f"file {file_path}\n")
            filelist_path = filelist.name

        ffmpeg.input(filelist_path, format='concat', safe=0).output(output_path, c='copy').run()
        logging.info(f"Successfully combined videos for job_id: {job_id}. Output: {output_path}")
        JobStatus.update_status(job_id, 'complete')

    except Exception as e:
        logging.error(f"Unexpected error combining videos for job_id: {job_id}: {str(e)}")
        JobStatus.update_status(job_id, 'failed')

    finally:
        if os.path.exists(filelist_path):
            os.remove(filelist_path)
