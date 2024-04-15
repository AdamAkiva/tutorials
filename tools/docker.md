# Docker & Docker-compose ubuntu installation guide

### Last update: 13.01.2024

### 2 minutes read

---

## Reasoning

Install guides should not be prevalent with software engineers, however installing
docker & docker-compose in an exception to this rule (in my opinion at least),
because there are a lot of different and unclear ways to do it. This is the easiest
way I've found to do it

## Target

This guide is for people who want the CLI of docker, not the GUI version. For a
GUI version, please follow this:  
https://docs.docker.com/desktop/install/linux-install/

---

## Steps

1. Remove any previous versions: https://docs.docker.com/engine/install/ubuntu/#uninstall-docker-engine
2. Set up Docker's Apt repo: https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository
3. Install docker packages:
   ```bash
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```
4. Check everything was installed correctly:
   ```bash
   docker --version; docker compose version
   ```
5. In order to support old format of docker-compose in addition to docker compose,
   run the following command (Feel free to skip this if you don't want to support the old format):
   ```bash
   echo 'docker-compose "$@"' > ~/docker-compose && sudo mv ~/docker-compose /usr/bin && sudo chmod +x /usr/bin/docker-compose
   ```
6. In order to run docker as **non-root** user:  
   https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user
