import subprocess
import sys

process = subprocess.Popen(["git", "pull", "origin", "master"], stdout=subprocess.PIPE)
output = process.communicate()[0]

print(output)