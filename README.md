# FlowCentric

**Find your flow.** A productivity web app with a daily dashboard, a Pomodoro focus timer and notes, built with plain HTML, CSS and JavaScript.

**Live demo:** https://waluschaferns7.github.io/flowcentric/

<img width="1917" height="916" alt="image" src="https://github.com/user-attachments/assets/57e2ea37-7f5b-417e-95fa-f6ba3ad53a05" />


## Features

- **Dashboard:** greeting, current date and daily overview cards (productivity score, focus time, tasks completed, focus streak)
- **Task manager:** add, edit, complete and delete tasks, with priority, due dates, filters (All / Active / Done) and sorting
- **Pomodoro timer:** custom focus, short break and long break lengths, with a long break after every 4 sessions
- **Notes:** create, edit, delete and search notes
- **Responsive design:** the sidebar becomes a slide-out menu on phones
- **Saved locally:** all data is stored in the browser with localStorage

## Built with

- HTML5
- CSS3 (Flexbox, Grid, media queries)
- JavaScript (ES6+)
- localStorage

## Project structure

    flowcentric/
    ├── index.html
    ├── style.css
    ├── script.js
    ├── storage.js
    ├── nav.js
    ├── timer/
    │   ├── timer.html
    │   └── timer.js
    └── notes/
        ├── notes.html
        └── notes.js

## Run it locally

1. Clone the repository
2. Open `index.html` in a browser, or use the VS Code Live Server extension

## How the score works

The productivity score is 60% tasks completed today and 40% focus time today (a 120-minute goal counts as full marks).

## Roadmap

- Settings page with data backup and import
- Weekly focus chart
- User accounts and sync across devices

## Author

Waluscha Fernandes - [GitHub](https://github.com/waluschaferns7)
