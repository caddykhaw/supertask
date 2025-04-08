# SuperTask

SuperTask is a task management application with role-based access control.

## Features

- **Task Management**:
  - Multiple task entry at once
  - Tasks grouped by date
  - Checkboxes for task completion
  - Drag-and-drop reordering
  - Task history with author information

- **User Management**:
  - Boss and Clerk roles
  - Role-based permissions
  - Boss can see and edit all tasks
  - Clerk can see all tasks but only edit their own

## Tech Stack

- **Frontend**: Next.js 15.2.4, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js App Router (RSC), API Routes
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/supertask.git
   cd supertask
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up the database
   ```bash
   npx drizzle-kit generate
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Visit http://localhost:3000 in your browser

### Demo Account

For demo purposes, use any email address with the password "password". The first user to sign up will automatically be assigned the Boss role.

## Project Structure

- `/app`: Next.js App Router pages
- `/components`: React components
- `/db`: Database schema and configuration
- `/lib`: Utility functions
- `/hooks`: Custom React hooks
- `/drizzle`: Database migrations

## License

This project is licensed under the MIT License.
