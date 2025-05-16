import os

# gunicorn 실행시 참조되는 config 파일을 정의합니다.
#
# - configuration 샘플 파일 (원본)
#   https://github.com/benoitc/gunicorn/blob/master/examples/example_config.py
#
# - 설정 값 참고
#   https://docs.gunicorn.org/en/stable/settings.html


#
# WSGI App 정의
#

wsgi_app = 'src.app.app:APP'

# Server Mechanics
#
#   preload_app - gunicorn은 기본적으로 master process에서 worker process를 fork한 후
#       각 worker process에서 어플리케이션을 임포트 합니다.
#
#       이 설정을 활성화하면 worker process를 fork하기 전에 어플리케이션 코드를 임포트합니다.
#
#   raw_env - 실행 환경의 environment variable을 추가할 수 있습니다.
#       복수개의 명령어도 가능합니다. 만약 command 실행 시 shell 레벨 정의된 환경 변수와
#       raw_env 설정값을 사용한 환경변수가 중복이 된다면, raw_env 설정값을 사용한 환경변수를
#       최종적으로 참조하여 사용하게 됩니다.
#
#   pidfile - master process의 pid 값이 저장ㅁ된 파일의 위치를 지정합니다.
#       이 설정을 사용하지 않으면 pid 파일을 생성하지 않습니다.
#
#       pid 파일은 다양한 용도로 사용될 수 있습니다.
#       예를 들어 pid 파일의 값을 이용하여 worker process의 개수를 조회한 다음
#       workers 설정값과 동일하게 생성이 되었는지 확인하는 validaiton 용도로도 사용할 수 있습니다.
preload_app = True

#
# Server socket 정의
#
#   bind - bind 할 소켓을 지정합니다. 기본값 '127.0.0.1:8000' 이며 복수개 지정이 가능합니다.
#       unix:PATH 를 사용하면 소켓 파일을 생성합니다.
#
#       예들 들어 unix:/tmp/gunicorn.sock 이라고 지정 시, /tmp/gunicorn.sock/ 파일이
#       생성됩니다.
#
#       A string of the form: 'HOST', 'HOST:PORT', 'unix:PATH'.
#       An IP is a valid HOST.
#
#   backlog - The number of pending connections. This refers
#       to the number of clients that can be waiting to be
#       served. Exceeding this number results in the client
#       getting an error when attempting to connect. It should
#       only affect servers under significant load.
#
#       Must be a positive integer. Generally set in the 64-2048
#       range.
#
#       listen system call의 backlog 인자입니다. gunicorn이 실행되면
#       master process에서 socket.listen을 호출하게 되고, 이때 이 설정값이 인자로 들어갑니다.
#       이 설정값은 실제 어플리케이션에서 처리하고 있는 커넥션을 제외하고 ESTABLISHED 상태로
#       유지가 될 수 있는 커넥션의 개수라고 볼 수 있습니다.
#
#       만약 nginx와 같은 웹서버가 앞단에 위치한다면, nginx가 허용할 수 있는 전체 커넥션 수와
#       gunicorn의 backlog 설정 값설정 값 사이의 관계를 고려해야 합니다.
#

bind = '0.0.0.0:8000'
backlog = 2048

#
# Worker processes
#
#   workers - The number of worker processes that this server
#       should keep alive for handling requests.
#
#       A positive integer generally in the 2-4 x $(NUM_CORES)
#       range. You'll want to vary this a bit to find the best
#       for your particular application's work load.
#
#       master 프로세스가 fork하는 worker 프로세스의 수입니다.
#       공식 문서에서는 2-4 X CPU 수를 추천하고 있습니다.
#       (https://docs.gunicorn.org/en/stable/settings.html#worker-processes)
#
#   worker_class - The type of workers to use. The default
#       async class should handle most 'normal' types of work
#       loads. You'll want to read http://gunicorn/deployment.hml
#       for information on when you might want to choose one
#       of the other worker classes.
#
#       An string referring to a 'gunicorn.workers' entry point
#       or a python path to a subclass of
#       gunicorn.workers.base.Worker. The default provided values
#       are:
#
#           egg:gunicorn#sync
#           egg:gunicorn#eventlet   - Requires eventlet >= 0.9.7
#           egg:gunicorn#gevent     - Requires gevent >= 0.12.2 (?)
#           egg:gunicorn#tornado    - Requires tornado >= 0.2
#
#       worker process의 종류입니다. 기본값은 sync(동기 worker)이며,
#       이 경우 worker process는 하나의 커넥션의 요청만 처리할 수 있습니다.
#
#       비동기 worker에는 다양한 종류가 있지만, 그 중에 gevent를 예를 들어 보겠습니다.
#       gevent를 사용하는 경우, coroutine 을 사용하여 실행되기 때문에,
#       하나의 worker process에서 다수의 커넥션 요청을 동시에 처리할 수 있습니다.
#       실제로 CPU intensive job을 worker process 개수(CPU 수보다 값이 큼)만큼
#       실행한 경우에도, health check 용도 같은 간단한 API를 호출 했을 시,
#       응답을 문제 없이 내려주는 것을 확인하였습니다.
#
#   worker_connections - For the eventlet and gevent worker classes
#       this limits the maximum number of simultaneous clients that
#       a single process can handle.
#
#       A positive integer generally set to around 1000.
#
#       worker_class 값이 eventlet 또는 gevent일때만 의미가 있는 값입니다.
#       worker process 당 허용할 수 있는 커넥션의 개수입니다.
#
#   timeout - If a worker does not notify the master process in this
#       number of seconds it is killed and a new worker is spawned
#       to replace it.
#
#       Generally set to thirty seconds. Only set this noticeably
#       higher if you're sure of the repercussions for sync workers.
#       For the non sync workers it just means that the worker
#       process is still communicating and is not tied to the length
#       of time required to handle a single request.
#
#       worker process로 요청이 들어왔는데, timeout (초) 내에 응답을 못받을 경우
#       worker process를 강제로 종료한 후 다시 생성합니다. 0 일 경우 timeout이 비활성화됩니다.
#
#       강제 종료이기 때문에, 웹어플리케이션에서 이 값의 영향을 받을 만한 API가 있다면
#       API 중간에 process가 종료되더라도 DB transaction 등을 적용해
#       문제 없도록 구성되어야 합니다.
#
#       또 주의해야 할 점은 nginx 등 앞단에 웹서버가 있다면, 웹서버의 timeout도 고려해야 합니다.
#       예를 들어 nginx가 reverse proxy로 구성되어 있다면 nginx의 proxy_read_timeout
#       설정값도 고려해줘야 합니다.
#
#       만약 AWS의 load balancer를 사용한다면 idle timeout 값도 고려를 해줘야 합니다.
#
#       sync worker가 아닌 경우 이 값은 큰 의미가 없습니다.
#       gevent를 worker_class로 설정하여 실험했을 때 timeout은 제대로 작동하지 않았습니다.
#
#   keepalive - The number of seconds to wait for the next request
#       on a Keep-Alive HTTP connection.
#
#       A positive integer. Generally set in the 1-5 seconds range.
#
#   max_requests - worker process가 정해진 수치만큼 요청을 받으면
#       재시작하도록 하는 설정입니다. 0이 기본값으로, 이 값일 때는 재시작을 하지 않습니다.
#       0 보다 큰 값을 넣으면 해당 수만큼 worker로 요청이 들어왔을 때 재시작 됩니다.
#
#       이 옵션은 memory leak의 원인 파악이 어려울 때 사용하면
#       메모리 부족현상을 해결 할 수 있어서 유용합니다.
#
#   max_requests_jitter - max_requests설정과 함께 사용하는 설정입니다.
#       worker process의 재시작에 시간차를 두어 요청을 일시적으로 받지 못하는 상황을 방지합니다.
#

def get_workers():
    """[summary]
        SC_NPROCESSORS_ONLN: list the number of processors currently online

    Returns:
        [type]: [description]
    """
    procs = os.sysconf('SC_NPROCESSORS_ONLN')
    if procs > 0:
        return procs * 2 + 1
    else:
        return 3

workers = get_workers()
worker_class = 'uvicorn.workers.UvicornWorker'
# worker_connections = 1000
timeout = 600
# keepalive = 2
max_requests = 1000
max_requests_jitter = 50

#
# Debugging 관련 정의
#
#   debug - Turn on debugging in the server. This limits the number of
#       worker processes to 1 and changes some error handling that's
#       sent to clients.
#
#       True or False
#
#   spew - Install a trace function that spews every line of Python
#       that is executed when running the server. This is the
#       nuclear option.
#
#       이 설정이 활성화 될 시 실행되는 모든 코드를 console에 출력합니다. 디버깅 용도로 이 설정이
#       존재하는 것 같지만, 활성화 하지 않는 것을 추천 합니다.
#       디버깅을 원할 시 IDE 에서 제공되는 툴 사용을 권장 합니다.
#
#       True or False
#
#   reload - code 변경시 마다 worker가 재시작됩니다. producation 환경에서는 궝장하지 않지만
#         development 환경에서는 변경된 코드에 대한 빠른 변화를 확인할 수 있기에 유용한 설정입니다.
#
#       True or False
#
#   check_config - configuration 설정 체크를 위한 설정입니다. (dry-run과 유사)
#         코드 상으로 실제로 app 들을 import 하는 과정까지 수행 합니다.
#         해당 설정으로 app의 로그파일 위치 등의 설정에 문제가 없는지 확인이 가능 합니다.
#
#       True or False
#
#   print_config - check_config 기능과 동일하며, 설정값을 console에 출력합니다.
#
#       True or False
#

debug = False
spew = False
reload = False
check_config = False
print_config = False

#
# Server mechanics
#
#   daemon - Detach the main Gunicorn process from the controlling
#       terminal with a standard fork/fork sequence.
#
#       True or False
#
#   pidfile - The path to a pid file to write
#
#       A path string or None to not write a pid file.
#
#   user - Switch worker processes to run as this user.
#
#       A valid user id (as an integer) or the name of a user that
#       can be retrieved with a call to pwd.getpwnam(value) or None
#       to not change the worker process user.
#
#   group - Switch worker process to run as this group.
#
#       A valid group id (as an integer) or the name of a user that
#       can be retrieved with a call to pwd.getgrnam(value) or None
#       to change the worker processes group.
#
#   umask - A mask for file permissions written by Gunicorn. Note that
#       this affects unix socket permissions.
#
#       A valid value for the os.umask(mode) call or a string
#       compatible with int(value, 0) (0 means Python guesses
#       the base, so values like "0", "0xFF", "0022" are valid
#       for decimal, hex, and octal representations)
#
#   tmp_upload_dir - A directory to store temporary request data when
#       requests are read. This will most likely be disappearing soon.
#
#       A path to a directory where the process owner can write. Or
#       None to signal that Python should choose one on its own.
#

daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

#
#   Logging
#
#   logfile - The path to a log file to write to.
#
#       A path string. "-" means log to stdout.
#
#   loglevel - The granularity of log output
#
#       A string of "debug", "info", "warning", "error", "critical"
#
#   access_log_format - gunicorn access log 에 대한 formatting을 지정할 수 있습니다.
#
#       참고: https://docs.gunicorn.org/en/stable/settings.html?highlight=access_log_format#access-log-format
#
#   accesslog - gunicorn access log 파일 위치를 지정 합니다.
#
#       A path string. "-" means log to stdout.
#
#   errorlog - gunicorn error log 파일 위치를 지정 합니다. 설정 이름은 errorlog 이지만,
#       worker process의 exception 에의한 로그 뿐만 아니라, gunicorn 실행
#       worker process 의 spawn, termination, matser process 관련 로그도 출력합니다.
#
#       A path string. "-" means log to stdout.

# logfile = '-'
# loglevel = 'info'
# access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
# accesslog = '/var/log/moneycoon/gunicorn_access.log'
# errorlog = '/var/log/moneycoon/gunicorn_error.log'

#
# Security
#
#   limit_request_line - HTTP의 request-line의 사이즈에 대한 제한값 (bytes)을 지정합니다.
#       기본값은 4092, 최대 8190 까지 지정가능하며, 0 설정이 제한없이 사용 가능합니다.
#       GET 호출에 대한 query parameter 도 이 제한값이 들어가기 때문에 클라이언트에서
#       최대로 호출할 수 있는 query parameter를 파악하여 값을 지정하는게 좋습니다.
#       그리고 이 값을 결정할 때는 gunicorn 구간 뿐만 아니라, nginx 등 앞단의 proxy 서버 설정
#       도 고려해야합니다.
#
#       이 값을 0 으로 설정하여 제한 없이 설정할 경우 DDOS 공격에 취약해질 가능성이 있으며,
#       설정에 대한 제어 권한이 없는 proxy 등에서 막힐 가능성이 있기 때문에, 만약 최대값 (8190)
#       가 넘어간다면, POST 방식을 고려하거나 기타 다른 방식에 대한 고려가 필요합니다.

# limit_request_line = 4092

#
# Process naming
#
#   proc_name - A base to use with setproctitle to change the way
#       that Gunicorn processes are reported in the system process
#       table. This affects things like 'ps' and 'top'. If you're
#       going to be running more than one instance of Gunicorn you'll
#       probably want to set a name to tell them apart. This requires
#       that you install the setproctitle module.
#
#       A string or None to choose a default of something like 'gunicorn'.
#

proc_name = None

#
# Server hooks
#
#   post_fork - Called just after a worker has been forked.
#
#       A callable that takes a server and worker instance
#       as arguments.
#
#   pre_fork - Called just prior to forking the worker subprocess.
#
#       A callable that accepts the same arguments as after_fork
#
#   pre_exec - Called just prior to forking off a secondary
#       master process during things like config reloading.
#
#       A callable that takes a server instance as the sole argument.
#

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def pre_fork(server, worker):
    pass

def pre_exec(server):
    server.log.info("Forked child, re-executing.")

def when_ready(server):
    server.log.info("Server is ready. Spawning workers")

def worker_int(worker):
    worker.log.info("worker received INT or QUIT signal")

    ## get traceback info
    import sys
    import threading
    import traceback
    id2name = {th.ident: th.name for th in threading.enumerate()}
    code = []
    for threadId, stack in sys._current_frames().items():
        code.append("\n# Thread: %s(%d)" % (id2name.get(threadId,""),
            threadId))
        for filename, lineno, name, line in traceback.extract_stack(stack):
            code.append('File: "%s", line %d, in %s' % (filename,
                lineno, name))
            if line:
                code.append("  %s" % (line.strip()))
    worker.log.debug("\n".join(code))

def worker_abort(worker):
    worker.log.info("worker received SIGABRT signal")
