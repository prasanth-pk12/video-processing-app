import redis
from .config import redis_host,redis_port, redis_db


redis_client = redis.StrictRedis(host=redis_host, port=redis_port, db=redis_db)

class JobStatus:
    @staticmethod
    def get_status(job_id):
        status = redis_client.get(job_id)
        if status is not None:
            status = status.decode("utf-8")
        return {"job_id": job_id, "status": status}

    @staticmethod
    def update_status(job_id, status):
        redis_client.set(job_id, status)
