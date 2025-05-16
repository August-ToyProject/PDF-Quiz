import logging
import os
import sys
import traceback
from functools import wraps


class CustomLogger:
    """
    Description: 사용자 정의 로거 클래스입니다.
    Param: name (str) - 로거의 이름, level (int) - 로깅 레벨 (기본값: logging.DEBUG)
    Return: None
    """
    def __init__(self, name, level=logging.DEBUG, log_directory = "logs"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        self.logger.handlers.clear()

        os.makedirs(log_directory, exist_ok=True)

        # 일반 로그용 핸들러
        console_handler = logging.StreamHandler()
        file_handler = logging.FileHandler(os.path.join(log_directory, "app.log"))

        # 에러 로그용 핸들러
        error_file_handler = logging.FileHandler(os.path.join(log_directory, "error.log"))
        error_file_handler.setLevel(logging.ERROR)

        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S')

        for handler in [console_handler, file_handler, error_file_handler]:
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def get_logger(self):
        """
        Description: 설정된 로거 객체를 반환합니다.
        Param: None
        Return: logging.Logger 객체
        """
        return self.logger

def get_my_logger(level=logging.DEBUG, log_directory='logs'):
    """
    Description: 기본 로거를 생성하고 반환합니다.
    Param: level (int) - 로깅 레벨 (기본값: logging.DEBUG)
    Return: logging.Logger 객체
    """
    return CustomLogger('app_logger', level, log_directory=log_directory).get_logger()

def log_decorator(log_directory="logs"):
    """
    Description: 함수 실행을 로깅하는 데코레이터입니다.
    Param:
        log_directory (str) - 로그 파일을 저장할 경로 (기본값: "logs")
    Return: decorator (callable) - 데코레이터 함수
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            func_name = func.__name__
            logger = get_my_logger(log_directory=log_directory)
            logger.debug(f"Starting function: {func_name}")
            try:
                result = await func(*args, **kwargs)
                logger.debug(f"Finished function: {func_name}")
                return result
            except Exception as e:
                error_logger = get_my_logger(logging.ERROR, log_directory=log_directory)

                # 원래 예외 추적
                original_exception = e
                while hasattr(original_exception, '__cause__') and original_exception.__cause__ is not None:
                    original_exception = original_exception.__cause__

                tb = traceback.extract_tb(original_exception.__traceback__)
                original_error = tb[-1]

                # 핵심 에러 정보 (가장 처음 발생한 에러)
                error_logger.error(f"\n{'!'*50}\nORIGINAL ERROR:\nFile: {original_error.filename}\nLine: {original_error.lineno}\nFunction: {original_error.name}\nError: {str(original_exception)}\n{'!'*50}\n")

                # 에러 전파 경로 로깅
                for frame in traceback.extract_tb(sys.exc_info()[2]):
                    error_message = f"Error in {frame.filename}, line {frame.lineno}, in {frame.name}: {str(original_exception)}"
                    error_logger.error(f"{'='*20}\n{error_message}\n{'='*20}")

                raise  # 원래 예외를 그대로 전파
        return wrapper
    return decorator