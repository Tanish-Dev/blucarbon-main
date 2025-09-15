# SIH-25

## Project Overview
SIH-25 is a web-based application designed to streamline and enhance project management and collaboration. The application is divided into two main parts:

1. **Frontend**: Built with modern JavaScript frameworks and libraries, the frontend provides an intuitive and user-friendly interface for users to interact with the application.
2. **Backend**: Powered by Python, the backend handles the server-side logic, data processing, and API endpoints.

---

## Features
### Frontend
- **Reusable Components**: A library of UI components such as buttons, cards, modals, and more.
- **Responsive Design**: Ensures compatibility across devices of all sizes.
- **State Management**: Efficient handling of application state.
- **Theming**: Customizable themes for a tailored user experience.

### Backend
- **API Endpoints**: Provides RESTful APIs for data interaction.
- **Data Processing**: Handles complex data operations efficiently.
- **Authentication**: Secure user authentication and authorization.

---

## Project Structure
```
SIH-25/
├── backend/
│   ├── requirements.txt
│   ├── server.py
│   └── __pycache__/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── tailwind.config.js
├── tests/
│   └── __init__.py
└── README.md
```

---

## Installation

### Prerequisites
- Node.js
- Python 3.11+
- Yarn (optional)
- Virtual Environment (optional)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python server.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
   or
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   yarn start
   ```
   or
   ```bash
   npm start
   ```

---

## Usage
1. Open the frontend application in your browser at `http://localhost:3000`.
2. Interact with the various features such as project management, dashboards, and settings.

---

## Contributing
We welcome contributions to improve this project. To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Open a pull request to the main repository.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments
- **Frontend Libraries**: Tailwind CSS, React
- **Backend Frameworks**: Python
- **Contributors**: Thanks to all contributors who have helped in building this project.
