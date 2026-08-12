import os
import shutil
import subprocess

repo_dir = r"c:\Users\sarth\Downloads\shaivarth-portfolio"
public_dir = os.path.join(repo_dir, "public")
temp_dir = os.path.join(repo_dir, ".gh-pages-deploy")

if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)

# Copy all contents from public to temp_dir
shutil.copytree(public_dir, temp_dir)

os.chdir(temp_dir)
subprocess.run(["git", "init"], check=True)
subprocess.run(["git", "checkout", "-b", "gh-pages"], check=True)
subprocess.run(["git", "add", "."], check=True)
subprocess.run(["git", "commit", "-m", "Deploy complete site to gh-pages"], check=True)
subprocess.run(["git", "remote", "add", "origin", "https://github.com/Shaivarth/Portfolio.git"], check=True)
subprocess.run(["git", "push", "-f", "origin", "gh-pages"], check=True)

def remove_readonly(func, path, exc_info):
    import stat
    os.chmod(path, stat.S_IWRITE)
    func(path)

os.chdir(repo_dir)
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir, onerror=remove_readonly)
print("Pushed complete site to gh-pages successfully!")
