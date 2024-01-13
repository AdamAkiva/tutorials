### NodeJS debug guide

#### Last update: 13/01/2024

---

**_Hello!_**  
This guide is intended for **developers interested in attaching the standard built-in nodeJS debugger to a project written in Javascript in VSCode** and being able to debug it while developing on a docker.

---

#### Requirements

1. Visual Studio Code (Sorry WebStorm users).
2. Docker & Docker-compose.
3. Preferably a project to test this guide on.

---

#### Introduction

So, let's start by addressing the issues. A flag for node exists which allows the process to be ran in so called "Debug mode": `--inspect=<ip_address>:port`  
**The main issue here is how do you add the docker to the mix.**
Luckily VSCode has a launch.json just for that!  
This guide will allow you to add a debugger to your project, but more importantly it will (try to) help you understand how and why everything in the examples is needed (and maybe, just maybe teach you extra stuff along the way).  
With that out of the way, let's dive in to it, shall we?

**Note before we start:** There will be many references to the code in this directory, you should look, copy parts of it and modify them to your needs.

---

#### The guide

You have a project or you intend to start one, how does one add a debugger to a nodeJS application? Well there are a couple of things which we need to do.

---

Every nodeJS projects starts with a package.json, so we will start with it as well.  
Everything will be the standard stuff except for how you launch the application in **DEV** mode. Keeping the debugger settings in **PRODUCTION** mode is a security breach in levels I can't express with words. Basically it boils down to adding the:  
`--inspect=0.0.0.0:<DEBUG_PORT>` to your launch configurations. `0.0.0.0` means every address has access to the debugger which will run in the docker image (You may limit it to your PC IP address, but I don't find it necessary).

---

**For example:**
`package.json`

```json
"start:dev": "npx nodemon --config nodemon.json ./src/main.js"
```

Let me explain each part:

- `npx nodemon` - **Run nodemon from the local project dependencies.** I really don't like to install stuff globally (If you have nodemon installed globally you may omit the prefix and use nodemon directly).
- `--config nodemon.json` - **Giving a path to the nodemon config file.** You can insert all the settings in the the CLI, but I much prefer to separate the configurations as much as possible.
- `./src/main.js` - **The entry point to your program.**

---

**Whereas the nodemon config looks something like:**
`nodemon.json`

```json
{
  "restartable": "rs",
  "watch": ["./src"],
  "execMap": {
    "js": "node --inspect=0.0.0.0:3001"
  },
  "ext": "js,json",
  "signal": "SIGINT",
  "delay": "333ms"
}
```

This is a bit more complicated so let's go over each line and explain it:

- `"restartable": "rs"` - **Allows you to type "rs" in the terminal to force restart nodemon at any given point.**
- `"watch": ["./src"]` - **An array of folders that you want to watch for changes,** causing nodemon to restart your project on any change in these directories.
- `"execMap":` - **An object which allows you to given different execution commands to different file extensions.** Since we work only with js extension this can be shortened but I'm a big fan of the O in SOLID (maybe a bit too much)
- `"js": "node --inspect=0.0.0.0:3001"` - **The important bit.** Node has two flags for running the debugger:

  1. --inspect - **attach the debugger to the process.**
  2. --inspect-brk - **attach the debugger to the process and break at the first line.**
     Personally I don't see a point in breaking on the line, since most of our development is for servers but if you want it, you are more than welcome to change it. In addition I'm not a fan of hard-coded values whenever possible so the $DEBUG_PORT is an env variable which will be supplied by the docker-compose file (can be hard-coded if you want to be wrong :).

- `"ext": "js,json"` - **glob pattern of file extensions to restart for in the watched directories.**
- `"signal": "SIGINT"` - **Send SIGINT signal to the process on restart.** I encountered an issue which cause the process to hang and cause the ADDR_ALREADY_IN_USE error while developing a server. This setting in addition to the delay helped to solve the issue. You can omit this setting if and until you encounter a similar issue.
- `"delay": "333ms"` - **Add a delay between restarts** to not spam the system with CTRL+S.

---

Ok. Now we have the **nodeJS settings ready**, what next? Well I'm going to imagine you asked, now we need to **configure the specific VSCode launch settings** for the debugger and making it work with docker-compose.

I'm not going to go over the docker files since they do not add anything new besides one thing. **The debugger runs on a port, this port needs to be mapped to a port on the host machine, the host machine port must match the one in the launch.json file.**

Now to the last but not least part, `launch.json`. This is a file which tells VSCode how to run the debugger (well it does way more, but the purposes of this guide that's how we will call it).
Again you should copy and modify the code to your purposes:

`launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug",
      "request": "attach",
      "type": "node",
      "port": 3001,
      "address": "localhost",
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}"
    }
  ]
}
```

- `"version": "0.2.0"` - From my recollection the 0.2.0 version is needed for some of these settings. You are welcome to test If I remember correctly and let me know.
- `"name": "Debug"` - **Can be changed to whatever,** this is only the name that will be displayed when you run the debugger.
- `"request": "attach"` - Has two options:
  **1. launch - Launch the project with debugger attached.** Since we ran the application using docker-compose this is problematic and **we will choose the second option.**
  **2. attach - Attach the debugger to a running process,** allowing us to connect or disconnect the debugger at will.
- `"type": "node"` - **The type of project we are debugging.**
- `"port": 3001` - **The port that the debugger will run on.** **Remember** that this will be the port **outside the docker.** This port must match the one exported by docker-compose which is the one indicated in the nodemon settings.
  **For example:**
  `nodemon.json` - `"js": "node --inspect=0.0.0.0:9229"`
  `docker-compose` - Ports option: `"3001:9229"`
  The settings in the specified files will "make" `"port": 3001` in launch.json work.
- `"address": "localhost"` - **The address where the debugger should listen to.** Since these settings are for VSCode which runs on the host localhost (which is the default) will work
- `"remoteRoot": "/app"` - **The location of the project inside the docker,** absolute path (depends on your docker-compose volume settings)
- `"localRoot": "${workspaceFolder}"` - **The location of the project on the host machine.** ${workspaceFolder} is a VSCode variable (see [this](https://code.visualstudio.com/docs/editor/variables-reference#_predefined-variables)).
  **Important note:** This config completely dependent on what VSCode folder you have open, you may config it otherwise but take into account that if you change the opened directory of your editor these configurations **will not work** unless you change this settings.

---

#### And that's it! You are ready to start using the almighty nodeJS debugger.

Enter the Run & Debug window of VSCode (Ctrl + Shift + D) and start debugging :)

---

#### Troubleshoot

- If you enter the Run & Debug window of VSCode (Ctrl + Shift + D) and you see a blue button saying **Run and Debug** then your VSCode is probably open in a different window than the one specified in your `"localRoot":` setting in launch.json.Check it points to the correct location.
- If you start the debugger and it hangs for some time followed by a disconnect, it probably means that the ports are not configured successfully. Check the example above and the code in this directory to see how it should be configured.
