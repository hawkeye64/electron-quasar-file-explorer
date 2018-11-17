# electron-quasar-file-explorer
A Simple File Explorer using Vue/Quasar/Electron

--- A work in progress ---

# Building an Electron File Explorer with Quasar (and Vue)

## Introduction
### What is Electron?
Electron is a framework that allows you to build cross platform desktop apps with javascript, HTML and CSS. 
> If you can build a website, you can build a desktop app. Electron is a framework for creating native applications with web technologies like Javascript, HTML and CSS. It takes care of the hard parts so you can focus on the core of your application.

[Electron Homepage](https://www.electronjs.org)

### What is Quasar?
Quasar Framework is an up and coming MIT licensed open-source framework powered by Vue.

With Quasar, you can build:

1. SPAs (Single Page App)
2. SSR (Server-side Rendered App) (+ optional PWA client takeover)
3. PWAs (Progressive Web App)
4. Mobile Apps (Android, iOS, …) through Apache Cordova
5. Multi-platform Desktop Apps (using Electron)

It is basically an all-in-one solution for web developers with a rich supply of components derived from innovative ideas and concepts that take away the pain (also known as [The Quasar Method](https://medium.com/quasar-framework/the-quasar-method-e19daf9abb5f) to Quasarians) of managing a project with eslint, webpack, babel, etc., so you can get on with developing your UI.

[Quasar Framework Homepage](https://www.quasar-framework.org)

### What is a File Explorer
A file explorer is a graphical user interface (GUI) that allows the User to visualize and traverse the file system of an operating system.

### Why a tutorial?
Why not?

Sarcasm aside, let me say just a few things. I work with Vue ([Vue Homepage](https://www.vuejs.org)) on a day-to-day basis and use Quasar Frameworks. We made this decision collaboratively back in September 2017. It was a gamble to use Vue and even more so for Quasar. Since then, as of this writing, Vue (118k) has more stars on Github than React (116k) or Angular (42.2k) ([Github Search](https://github.com/search?utf8=%E2%9C%93&q=repo%3Avuejs%2Fvue+repo%3Afacebook%2Freact+repo%3Aangular%2Fangular&type=Repositories&ref=advsearch&l=&l=)) and Quasar (7.7k) ([Quasar Github page](https://github.com/quasarframework/quasar)) is growing rapidly in polularity with it's all-in-one solution. So far, we feel our gample has paid off in spades ([In Spades Definition](https://www.idioms.thefreedictionary.com/in+spades)) as we gear up to release 5.0 of our product ([Intelliview Technologies Homepage](https://www.intelliviewtech.com)) after converting from Angular.

Ok, back to **why a tutorial**? Our product provides an intelligent camera that creates alert videos that Users can export to their computers, as well as archive videos. With that video, we have a custom SVG that runs as an overlay on top of the video so the User can see the analytics. Because the SVG is custom, we needed to write an offline viewer for these exported videos that can also play the associated SVG as an overlay. Thus, we used Electron and Quasar to develop a custom desktop application that fits our needs. So, yes, I am not **that** experienced with Electron, but I did learn things along the way, that, in this tutorial I will share with you.

### About the Tutorial
This is not a full tutorial with step-by-step instructions. The source code for the project is [freely available](https://github.com/hawkeye64/electron-quasar-file-explorer) and you are welcomed to download or fork the project and extend it out further.

What I will be discussing is design decisions, code decisions, electron security and highlight various coding issues.

## Design Decisions

### End Goal
The end goal is to have a file explorer that can traverse a User's file system. I want it to work with both Linux and Windows since we are making a desktop app. However, since I am mainly a Linux developer (C++ and Web), I need to get a copy of Windows to work with. Microsoft has a VM (Virtual Machine) with Windows 10 pre-installed that you can [download](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/) and has a 90-day limit. That will work perfect! I can use VirtualBox to import the VM and install all my tools and work concurrently in Linux and Windows.

One thing I need to keep in mind is that with Linux, the file system is under one hierarchy. All files and folders are under **root**. Windows is different in that each hard drive is basically a **root** of the files and folders that the hard drive contains. This will present a challenge as I'll need to get the hard drives being used by Windows and then treat each like a root.

### Existing File Explorers
Let's take a look at Windows Explorer:

![Windows Explorer - List Mode](https://github.com/hawkeye64/electron-quasar-file-explorer/blob/master/images/windows-explorer-list.png?raw=true)

![Windows Explorer - Grid Mode](https://github.com/hawkeye64/electron-quasar-file-explorer/blob/master/images/windows-explorer-grid.png?raw=true)

Let's take a look at Ubuntu Files:

![Ubuntu Files - List Mode](https://github.com/hawkeye64/electron-quasar-file-explorer/blob/master/images/ubuntu-files-list.png?raw=true)

![Ubuntu Files - Grid Mode](https://github.com/hawkeye64/electron-quasar-file-explorer/blob/master/images/ubuntu-files-grid.png?raw=true)

Both file explorers offer a grid and list mode. They also have an (optional) address bar at the top. There is navigation of various sorts on the left side.

### Design
I want to keep a similar look-and-feel so that the User will already be familiar with Using my file explorer from the first time they start it.

Here are the things I'll do:

1. Have a read-only address bar that shows the current path. I'll call this the **breadcrumb** bar. For each part of the path, the User will be able to click on it in order to make back-traveral easy.

2. Show **shortcuts** on the left side. This will show links to a number of pre-defined paths. Both Windows and Linux share this concept. Like, the **home**, **documents**, and **downloads** folder. I don't want to hard-code this, so I'll have to research if there is a way of getting them via Electron.

3. Under the **shortcuts** I want to show a traversal-tree that expands each folder to show additional folders. I'll be able to use the Quasar **QTree** component for this. It provides for **lazy loading** of each tree node, so this will be perfect as I want to load data on-demand to keep things running quickly.

4. In the main **content** area I want to show the contents of a folder. The contents may contain other folders as well as files. I want to display the file name and I want to display an icon that represents the file mime type for the most commonly used files. In the content area, I also want the User to be able to switch between grid and list views. And, finally, if the User double-clicks on a folder in the content area, the UI will navigate to the selected folder.

5. Finally, in the content area, if additional files are added, removed, modified, while vieweing, then they'll automatically be updated. There is a great package called [Chokidar](https://github.com/paulmillr/chokidar) that I can use to watch files and give me notifications.

Here are things I won't do:

1. Double-clicking a file won't open it. Although this would be nice, this is not one of my goals at this time. 

2. The User will be unable to create, delete or modify files. This will be a read-only app only to provide proof-of-concept abilities only.

3. The User will be unable to get information (properties) about a selected file.

In general, the User won't be able to do much except traverse the file system.

These items are likely something I'd do when I expand out this project with additional functionality.


