import sys, os, subprocess

bp = os.path.abspath("coastpulse/backend")
sp = os.path.abspath("coastpulse/scientific-engine")
env = os.environ.copy()
env["PYTHONPATH"] = bp + os.pathsep + sp

# Spawn detached background process on Windows
DETACHED_PROCESS = 0x00000008
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    env=env,
    cwd=bp,
    creationflags=DETACHED_PROCESS,
    close_fds=True
)
print(f"Backend started with PID: {proc.pid}")
