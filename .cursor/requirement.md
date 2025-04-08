# SuperTask Requirements Understanding

## Project Overview
SuperTask is a task management web application designed for businesses with a hierarchical structure, specifically accommodating "Boss" and "Clerk" roles with different permission levels. The application enables efficient task creation, organization, and tracking while maintaining clear accountability and role-based access.

## Task Management Features

### Multi-Task Entry
- Users can enter multiple tasks simultaneously in a batch
- Support for parsing tasks from text input with one task per line
- Ability to add optional descriptions using a colon separator

### Task Organization
- Tasks are automatically grouped and displayed by due date
- Special "No Due Date" group for tasks without specific deadlines
- Tasks ordered chronologically with most recent dates first

### Task Interaction
- Interactive checkboxes for marking tasks as complete/incomplete
- Visual differentiation between completed and pending tasks
- Task information displays title, description, and author

### Drag-and-Drop Functionality
- Tasks can be reordered within their date groups using drag-and-drop
- Order changes persist in the database
- Visual feedback during dragging operations

## User Management

### Role-Based Access Control
- **Boss Role**:
  - Can view all tasks in the system
  - Can edit and complete any task
  - Can add new users (both Boss and Clerk roles)
  - Can manage the entire task ecosystem

- **Clerk Role**:
  - Can view all tasks in the system
  - Can only edit/complete their own tasks
  - Cannot modify tasks created by other users
  - Restricted from accessing user management functions

### Authentication
- Email-based authentication system
- First user automatically receives Boss role
- Subsequent users default to Clerk role unless explicitly created as Boss
- Simple password demo for easy testing ("password")

## Technical Requirements

### Frontend
- Next.js 15.2.4 as the primary framework
- Tailwind CSS 4 for styling
- ShadCN UI component library for consistent design
- Responsive layout that works on various devices

### Backend
- Next.js App Router for server-side logic
- NextAuth.js for authentication and session management
- Server Actions for form handling and data mutations

### Database
- SQLite as the database engine
- Drizzle ORM for type-safe database operations
- Schema includes:
  - Users table with role information
  - Tasks table with ordering capability
  - Relationships between users and tasks

### Interactions
- Real-time UI updates when task status changes
- Toast notifications for operation feedback
- Permission-based UI elements (showing/hiding controls)
- Drag-and-drop reordering with visual feedback

## User Experience Goals
- Clean, intuitive interface requiring minimal training
- Clear visual hierarchy and information organization
- Immediate feedback for user actions
- Role-appropriate access controls and UI elements
- Efficient batch task creation to minimize repetitive actions

This application serves as a streamlined task management system with role-based permissions, providing an efficient way for organizations to manage work assignments with clear ownership and accountability. 