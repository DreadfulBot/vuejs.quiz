import subprocess
import sys

if(len(sys.argv) < 2):
    comment = "fixes"
else:
    comment = sys.argv[1]

subprocess.call("git commit -m \"%s\"" % comment)
subprocess.call("git add .")
subprocess.call("git push origin master")
