import subprocess
import sys

process = subprocess.Popen(["git", "add", "."], stdout=subprocess.PIPE)
process = subprocess.Popen(["git", "commit", "-m", sys.argv[1]], stdout=subprocess.PIPE)
process = subprocess.Popen(["git", "push", "origin", "master"], stdout=subprocess.PIPE)

output = process.communicate()[0]

print(output)