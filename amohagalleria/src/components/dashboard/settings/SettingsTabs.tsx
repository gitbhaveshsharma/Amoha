"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtCategoryTable } from "./ArtworkSettings/ArtCategoryTable";
import { CurrencyTable } from "./PayoutSettings/CurrencyTable";

export function SettingsTabs() {
    return (
        <Tabs defaultValue="artwork" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="artwork">Artwork </TabsTrigger>
                <TabsTrigger value="payout">Payout </TabsTrigger>
            </TabsList>
            <TabsContent value="artwork">
                <ArtCategoryTable />
            </TabsContent>
            <TabsContent value="payout">
                <CurrencyTable />
            </TabsContent>
        </Tabs>
    );
}