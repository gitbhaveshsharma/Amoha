import React from "react";
import { SettingsTabs } from "@/components/dashboard/settings/SettingsTabs";

export function SettingsSection() {
    return (
        <div className=" mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <SettingsTabs />
        </div>
    );
}