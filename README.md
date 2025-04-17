# Amoha Galleria

Amoha Galleria is a modern art gallery platform built with Next.js, Supabase, and Tailwind CSS. It allows users to explore, upload, and manage artworks, as well as maintain wishlists and carts for a seamless user experience.

## Features

- **User Authentication**: Secure login and signup using Supabase.
- **Artwork Management**: Upload, edit, and delete artworks with detailed metadata.
- **Wishlist**: Add and manage favorite artworks.
- **Cart**: Add artworks to the cart and proceed to checkout.
- **Responsive Design**: Fully responsive UI for all devices.
- **Service Worker**: Offline support with a custom service worker.
- **Dashboard**: User-friendly dashboard for managing artworks, wishlist, and profile.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: Zustand
- **Utilities**: React Hook Form, Zod, React Toastify
- **Deployment**: Vercel

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gitbhaveshsharma/Amoha.git
   cd amoha-galleria
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   REDIS_URL=your-redis-url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## Folder Structure

```
src/
├── app/                # Next.js app directory
│   ├── (auth)/         # Authentication-related pages
│   ├── (dashboard)/    # Dashboard pages
│   ├── (carts)/        # Cart-related pages
│   ├── (artworks)/     # Artwork details pages
│   ├── layout.tsx      # Root layout
│   ├── metadata.ts     # Metadata configuration
├── components/         # Reusable UI components
├── context/            # Context providers (e.g., Cart, Wishlist)
├── lib/                # Utility functions and configurations
├── schemas/            # Zod schemas for form validation
├── stores/             # Zustand stores for state management
├── styles/             # Global styles
├── types/              # TypeScript types
└── utils/              # Helper utilities
```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint to check for code quality issues.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)
- [Zod](https://zod.dev/)
- [Lucide Icons](https://lucide.dev/)
