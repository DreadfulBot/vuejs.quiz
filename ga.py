import subprocess
import sys

if(len(sys.argv) < 2):
    comment = "fixes"
else:
    comment = sys.argv[1]

process = subprocess.Popen(["git", "add", "."], stdout=subprocess.PIPE)
process = subprocess.Popen(["git", "commit", "-m", comment], stdout=subprocess.PIPE)
process = subprocess.Popen(["git", "push", "origin", "master"], stdout=subprocess.PIPE)

output = process.communicate()[0]

print(output)