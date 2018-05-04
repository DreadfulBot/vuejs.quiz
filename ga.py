import subprocess

process = subprocess.Popen(["git", "add", "."], stdout=subprocess.PIPE)
process = subprocess.Popen(["git", "commit", "-m", "test"], stdout=subprocess.PIPE)
process = subprocess.Popen(["git", "push", "origin", "master"], stdout=subprocess.PIPE)

output = process.communicate()[0]

print(output)