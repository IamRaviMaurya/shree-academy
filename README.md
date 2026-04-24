# Shree Academy - Book Issue Management System

A modern React application for managing book issues at Shree Academy, built with TypeScript, Tailwind CSS, and featuring Excel import/export functionality.

## Features

- 📚 **Book Issue Management**: Add, view, edit, and delete book issue records
- 📊 **Statistics Dashboard**: Real-time stats showing total records, books, students, and value
- 🔍 **Search & Filter**: Search records by student name or book name
- 📊 **Excel Integration**: Import records from Excel files and export data
- 🧾 **Invoice Generation**: Generate and print professional invoices
- 💬 **WhatsApp Sharing**: Share invoice details via WhatsApp
- 💾 **Local Storage**: Data persists in browser local storage
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Excel Processing**: SheetJS (xlsx)
- **Build Tool**: Create React App
- **State Management**: React hooks with local storage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button component
│   ├── Card.tsx        # Card wrapper component
│   ├── Input.tsx       # Form input component
│   ├── Badge.tsx       # Status badge component
│   ├── IconButton.tsx  # Icon button component
│   ├── Modal.tsx       # Modal dialog component
│   ├── Toast.tsx       # Notification toast component
│   ├── Header.tsx      # App header component
│   ├── Tabs.tsx        # Tab navigation component
│   ├── StatsGrid.tsx   # Statistics display component
│   ├── AddRecordForm.tsx # Book issue form
│   ├── RecordsTable.tsx  # Data table component
│   ├── ExcelPanel.tsx    # Excel import/export panel
│   └── InvoiceModal.tsx  # Invoice preview modal
├── hooks/              # Custom React hooks
│   ├── useRecords.ts   # Records management hook
│   └── useToast.ts     # Toast notifications hook
├── utils/              # Utility functions
│   ├── helpers.ts      # General helper functions
│   ├── storage.ts      # Local storage utilities
│   ├── excel.ts        # Excel processing utilities
│   ├── whatsapp.ts     # WhatsApp sharing utilities
│   └── cn.ts          # Class name utility
├── types/              # TypeScript type definitions
│   └── index.ts       # Main type definitions
├── assets/             # Static assets
└── App.tsx            # Main application component
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shree-academy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

This will create a `build` folder with the production-ready files.

## Usage

### Adding Records

1. Navigate to the "Add Record" tab
2. Fill in the book details, student information, and dates
3. Click "Add Record" to save

### Viewing Records

1. Go to the "Records" tab
2. Use the search bar to filter records
3. View statistics at the top
4. Use action buttons to view invoices, share on WhatsApp, or delete records

### Excel Operations

1. Visit the "Excel" tab
2. **Import**: Click the upload area to select an Excel file
3. **Export**: Download current records or get a template

### Invoice Generation

1. From the records table, click the invoice icon (🧾)
2. Preview the invoice in the modal
3. Print or share via WhatsApp

## Data Storage

All data is stored locally in the browser using `localStorage`. Records persist between sessions but are not synchronized across devices.

## Excel Format

For importing data, Excel files should have these columns:
- Book Name
- Book Price (₹)
- Quantity
- Student Name
- Class
- Issue Date
- Return Date
- Notes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.