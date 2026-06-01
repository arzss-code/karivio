# CareerGen

CareerGen is an advanced ATS (Applicant Tracking System) Checker and Resume Generation web application. It is designed to help professionals optimize their resumes against job descriptions, ensuring higher compatibility with modern ATS systems.

## Key Features

- ATS Resume Checker: Analyze resumes against target job descriptions to calculate match scores and identify missing keywords.
- PDF Text Extraction: Extract and parse text from PDF resumes accurately.
- Resume Generation: Create modern, minimal, or classic ATS-friendly resumes.
- Smart Rewrite Suggestions: Enhance resume impact using AI-driven rewriting suggestions.
- History Tracking: Save and manage previously analyzed documents.
- Payment Integration: Process transactions securely via Midtrans.

## Technology Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database & Authentication: Supabase
- PDF Parsing: unpdf
- State Management: Nanostores
- Testing: Jest (Unit) & Playwright (E2E)
- Payments: Midtrans Client

## Getting Started

### Prerequisites

Ensure you have Node.js and `pnpm` installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies using pnpm:

```bash
pnpm install
```

3. Set up the environment variables. Copy the `.env.example` file to `.env` and configure the necessary values, including Supabase and Midtrans credentials.

### Running the Application

To start the local development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create an optimized production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Testing

Run unit tests using Jest:

```bash
pnpm test
```

Run End-to-End tests using Playwright:

```bash
pnpm test:e2e
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
