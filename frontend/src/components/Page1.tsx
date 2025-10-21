'use client';
import { isInitialized } from '@/lib/nexus';
import { useState } from "react";
import UnifiedBalance from "./init-button";

export default function Page1() {
    const [initialized, setInitialized] = useState(isInitialized());

    const btn =
    'px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

    return <div>
        <h1>Page 1</h1>
        <UnifiedBalance/>
    </div>
}