'use client'

import React, { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { useUserManagementStore } from '@/stores/admin/userManagement/userManagementStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Mail, Calendar, Languages, Accessibility } from 'lucide-react'
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

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params)
    const { users, fetchFilteredUsers } = useUserManagementStore()
    const [artist, setArtist] = useState<Artist | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadArtist = async () => {
            if (users.length === 0) {
                await fetchFilteredUsers()
            }

            const foundArtist = users.find(user =>
                user.id === resolvedParams.id && user.role === 'artist'
            ) as Artist | undefined

            setArtist(foundArtist || null)
            setIsLoading(false)
        }

        loadArtist()
    }, [resolvedParams.id, users, fetchFilteredUsers])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
                        <div className="relative px-6 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                                <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />
                                <div className="mt-4 sm:mt-0 flex-1">
                                    <Skeleton className="h-8 w-48 mb-2" />
                                    <Skeleton className="h-4 w-32 mb-4" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!artist) {
        notFound()
    } const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getFullAddress = () => {
        const parts = [
            artist.address,
            artist.city,
            artist.state,
            artist.postal_code,
            artist.country
        ].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : 'Address not provided'
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/artists" passHref>
                    <Button variant="outline" className="mb-6">
                        ← Back to Artists
                    </Button>
                </Link>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
                    <div className="relative px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                <AvatarImage src={artist.avatar_url} alt={artist.name} />
                                <AvatarFallback className="bg-blue-500 text-white text-3xl">
                                    {getInitials(artist.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mt-4 sm:mt-0 flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">{artist.name}</h1>
                                <div className="flex items-center space-x-4 mt-2">
                                    <Badge variant={artist.is_active ? 'default' : 'secondary'}>
                                        {artist.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                        {artist.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Bio Section */}
                    {artist.bio && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">About</h2>
                            <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
                        </section>
                    )}

                    {/* Contact Information */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <span>{artist.email}</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                                <span>{getFullAddress()}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Personal Information */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                        <div className="space-y-4">
                            {artist.gender && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                                    <p>{artist.gender}</p>
                                </div>
                            )}

                            {artist.pronouns && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Pronouns</h3>
                                    <p>{artist.pronouns}</p>
                                </div>
                            )}

                            {artist.cultural_identity && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Cultural Identity</h3>
                                    <p>{artist.cultural_identity}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Preferences */}
                    {(artist.preferred_languages || artist.accessibility_needs) && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                            <div className="space-y-4">
                                {artist.preferred_languages && (
                                    <div className="flex items-start space-x-3">
                                        <Languages className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Languages</h3>
                                            <p>{artist.preferred_languages}</p>
                                        </div>
                                    </div>
                                )}

                                {artist.accessibility_needs && (
                                    <div className="flex items-start space-x-3">
                                        <Accessibility className="h-5 w-5 text-gray-500 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Accessibility Needs</h3>
                                            <p>{artist.accessibility_needs}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Account Information */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                                    <p>{formatDate(artist.created_at)}</p>
                                </div>
                            </div>




                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}