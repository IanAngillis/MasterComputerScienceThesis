import os
import subprocess
import time


def build_project(dockerfile_path, output_path):
    # Extract the Dockerfile name
    dockerfile_name = os.path.basename(dockerfile_path)
    print("dockerfile name: " + dockerfile_name)
    # Get the project directory path
    project_dir = os.path.dirname(dockerfile_path)
    print("project dir: " + project_dir)
    # Change to the project directory - sets the build context
    os.chdir(project_dir)

    dockerfile_name = project_dir.split("\\")[-1]
    # Build the Docker image
    start_time = time.time()
    build_command = ['docker', 'build', '-t', dockerfile_name, '.']
    subprocess.call(build_command)
    build_time = time.time() - start_time

    # Get the image size
    inspect_command = ['docker', 'image', 'inspect', '-f', '{{.Size}}', dockerfile_name]
    process = subprocess.Popen(inspect_command, stdout=subprocess.PIPE)
    output, _ = process.communicate()
    image_size = output.decode().strip()

    # Write the results to the output file
    output_file = os.path.join(output_path, f"{dockerfile_name}.txt")
    with open(output_file, 'w') as file:
        file.write(f"Build Time: {build_time:.2f} seconds\n")
        file.write(f"Image Size: {image_size} bytes\n")

    # Remove the built image to clear the cache
    remove_command = ['docker', 'rmi', dockerfile_name]
    subprocess.call(remove_command)

    print("done")

def clear_docker_cache():
    # Remove unused images, networks, containers, and volumes
    prune_command = ['docker', 'system', 'prune', '-af']
    subprocess.call(prune_command)



#Idea - compute the new Dockerfiles and already build them. if they fail - fix, or keep them and blame the tool for bugs.
def main():
    # Specify the paths
    project_folder = "C:\\Users\\Ian.IAN-RIG\\Desktop\\input"  # Path to the folder containing the projects
    output_folder = "C:\\Users\\Ian.IAN-RIG\\Desktop\\output"  # Path to the folder where the results will be stored

    # Iterate over the projects
    for root, dirs, files in os.walk(project_folder):
        for file in files:
            if file == 'Dockerfile':
                dockerproject_tag = root.split('\\')[-1]
                print("tag: " + dockerproject_tag)
                dockerfile_path = os.path.join(root, file)
                print("os path: " + dockerfile_path)
                build_project(dockerfile_path, output_folder)
    clear_docker_cache()

if __name__ == '__main__':
    main()
