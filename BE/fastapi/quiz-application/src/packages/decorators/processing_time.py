import logging
import os
import time
from functools import wraps


def setup_performance_logger(log_directory="logs"):
    """
    Description: 실행 시간 로깅을 위한 로거를 설정합니다.
    Param: log_directory (str) - 로그 파일을 저장할 경로 (기본값: "logs")
    Return: logging.Logger 객체
    """
    logger = logging.getLogger('performance_logger')

    # 이미 핸들러가 설정되어 있다면 초기화
    if logger.handlers:
        logger.handlers.clear()

    logger.setLevel(logging.INFO)

    os.makedirs(log_directory, exist_ok=True)

    file_handler = logging.FileHandler(os.path.join(log_directory, "execution_time.log"))
    formatter = logging.Formatter('%(asctime)s - %(message)s', '%Y-%m-%d %H:%M:%S')
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    # 로거가 상위 로거로 메시지를 전파하지 않도록 설정
    logger.propagate = False

    return logger

def execution_time_decorator(log_directory="logs"):
    """
    Description: 함수의 실행 시간을 측정하고 로그 파일에 기록하는 데코레이터입니다.
    Param: log_directory (str) - 로그 파일을 저장할 경로 (기본값: "logs")
    Return: decorator (callable) - 데코레이터 함수
    """
    performance_logger = setup_performance_logger(log_directory)

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            result = await func(*args, **kwargs)
            end_time = time.perf_counter()
            total_time = end_time - start_time
            performance_logger.info(f'Function {func.__name__} took {total_time:.4f} seconds')

            # 로그를 즉시 파일에 쓰도록 강제
            for handler in performance_logger.handlers:
                handler.flush()

            return result
        return wrapper
    return decorator