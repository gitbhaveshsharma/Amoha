import Link from 'next/link';
import { Gift } from 'lucide-react';

const DonationHeader: React.FC = () => {
    return (
        <div className="w-full h-8 bg-gradient-to-r from-[#1d4b50] to-[#1d4b50] flex items-center justify-center overflow-hidden">
            <Link
                href="/donation-info"
                className="flex items-center text-sm text-white whitespace-nowrap overflow-hidden text-ellipsis tracking-wide"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Gift className="mr-1" />Project:
                DAAN invites artwork donations auction proceeds support "Mission Zero Hunger" to fight global hunger.
            </Link>
        </div>
    );
};

export default DonationHeader;