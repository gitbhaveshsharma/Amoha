'use client'

import React, { useEffect, useState } from 'react'
import { useUserManagementStore } from '@/stores/admin/userManagement/userManagementStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, User } from 'lucide-react'
import Link from 'next/link'

interface Artist {
    id: string
    user_id: string
    name: string
    email: string
    role: string
    created_at: string
    bio?: string
    address?: string
    avatar_url?: string
    is_temp?: boolean
    device_id?: string
    notification_opt_in?: boolean
    last_notification_shown_at?: string
    is_active?: boolean
    country?: string
    state?: string
    postal_code?: string
    city?: string
    gender?: string
    pronouns?: string
    preferred_languages?: string
    accessibility_needs?: string
    cultural_identity?: string
}

const ITEMS_PER_PAGE = 12

const ArtistPage: React.FC = () => {
    const { users, loading, error, fetchFilteredUsers, setFilters } = useUserManagementStore()
    const [displayedArtists, setDisplayedArtists] = useState<Artist[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    useEffect(() => {
        setFilters({ role: 'artist' })
        fetchFilteredUsers()
    }, [setFilters, fetchFilteredUsers])

    useEffect(() => {
        const artists = users.filter(user => user.role === 'artist') as Artist[]
        const paginatedArtists = artists.slice(0, currentPage * ITEMS_PER_PAGE)
        setDisplayedArtists(paginatedArtists)
        setHasMore(paginatedArtists.length < artists.length)
    }, [users, currentPage])

    const handleLoadMore = async () => {
        setIsLoadingMore(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setCurrentPage(prev => prev + 1)
        setIsLoadingMore(false)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getLocation = (artist: Artist) => {
        const parts = [artist.city, artist.state, artist.country].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : artist.address || 'Location not specified'
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">
                    <p>Error loading artists: {error}</p>
                    <Button onClick={() => fetchFilteredUsers()} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    } return (
        <div className="container mx-auto px-4 py-8">
            {loading && displayedArtists.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full mb-4" />
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {displayedArtists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedArtists.map((artist) => (
                        <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={artist.avatar_url} alt={artist.name} />
                                        <AvatarFallback className="bg-blue-500 text-white">
                                            {getInitials(artist.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg font-semibold truncate">
                                            {artist.name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 truncate">{artist.email}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {artist.bio && (
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {artist.bio}
                                        </p>
                                    )}
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span className="truncate">{getLocation(artist)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <Badge variant={artist.is_active ? 'default' : 'secondary'}>
                                        {artist.is_active ? 'Active' : 'Inactive'}
                                    </Badge>

                                    <Link href={`/artists/${artist.id}`} passHref>
                                        <Button variant="outline" size="sm">
                                            View Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {hasMore && displayedArtists.length > 0 && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="px-8 py-2"
                    >
                        {isLoadingMore ? 'Loading...' : 'Load More Artists'}
                    </Button>
                </div>
            )}

            {!loading && displayedArtists.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No artists found</p>
                        <p className="text-sm">There are currently no artists in the system.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ArtistPage