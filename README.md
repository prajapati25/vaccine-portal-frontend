# School Vaccination Portal - Frontend

A modern React-based frontend application for managing school vaccination drives and student records.

## Features

- 📱 Responsive design for all devices
- 🔐 Secure authentication and authorization
- 📊 Interactive dashboard with key metrics
- 👥 Student management system
- 💉 Vaccination drive scheduling and tracking
- 📝 Vaccination record management
- 📈 Comprehensive reporting system
- 🎨 Modern UI with consistent styling

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls
- React Icons
- React Query for data fetching
- React Hook Form for form handling
- React Hot Toast for notifications

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8080
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── context/       # React context providers
│   └── assets/        # Static assets
├── public/            # Public assets
└── index.html         # Entry HTML file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Key Features Implementation

### Authentication
- JWT-based authentication
- Role-based access control
- Secure token storage
- Automatic token refresh

### Student Management
- Student registration and profile management
- Grade-wise student listing
- Student vaccination history
- Bulk student import/export

### Vaccination Drive Management
- Drive scheduling and planning
- Batch management
- Grade-wise targeting
- Dose tracking
- Drive status monitoring

### Reporting
- Real-time statistics
- Customizable reports
- Export functionality
- Data visualization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
