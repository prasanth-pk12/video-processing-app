from .tasks import celery
from .config import redis_url


celery.conf.update(
    broker_url=redis_url,
    result_backend=redis_url
)

if __name__ == "__main__":
    celery.start()
