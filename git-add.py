import subprocess
import sys

if(len(sys.argv) < 2):
    comment = "fixes"
else:
    comment = sys.argv[1]

command = "git commit -m '" + comment + "'"


subprocess.call(command)
subprocess.call("git add .")
subprocess.call("git push origin master")
