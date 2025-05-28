'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProfileData } from '@/types/profile';
import { motion } from 'framer-motion';

interface ArtistProfileProps {
  artist: ProfileData | null;
}

export default function ArtistProfile({ artist }: ArtistProfileProps) {
  if (!artist) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="border rounded-lg p-6 space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary">
          <Image
            src={artist.avatar_url || '/placeholder-avatar.jpg'}
            alt={artist.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{artist.name}</h3>
          <p className="text-sm text-muted-foreground">
            {artist.city}, {artist.country}
          </p>
        </div>
      </div>

      {artist.bio && (
        <p className="text-sm text-muted-foreground">{artist.bio}</p>
      )}

      <Button asChild variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-colors">
        <Link href={`/artist/${artist.id}`} className="flex items-center justify-center gap-2">
          <span>View Artist Profile</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </Button>
    </motion.div>
  );
}