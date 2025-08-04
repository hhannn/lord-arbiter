// login/page.tsx

"use client";
import * as React from "react";

import { useUserData } from "@/store/useUserData";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Home() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const router = useRouter();

    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleLogin = async () => {
        const res = await fetch(`${API_BACKEND_URL}/api/user/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            await useUserData.getState().fetchData(); // ✅ fetch info from /api/user/data
            router.push("/dashboard");
        } else {
            // handle login failure
        }
    };

    const handleRegister = async () => {
        const res = await fetch(`${API_BACKEND_URL}/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
                api_key: apiKey,
                api_secret: apiSecret,
            }),
        });

        if (res.ok) {
            await useUserData.getState().fetchData(); // ✅ fetch info from /api/user/data
            router.push("/dashboard");
        } else {
            // handle login failure
        }
    };

    return (
        <main className="flex flex-col items-stretch justify-center gap-8 p-4 max-w-sm mx-auto min-h-screen">
            <Card>
                <CardHeader>
                    <h1 className="text-2xl sm:text-4xl font-medium">
                        Lord Arbiter
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Weeping may endure for a night, but joy comes in the
                        morning.
                    </p>
                </CardHeader>
                <Tabs defaultValue="Login" className="flex flex-col gap-4">
                    <TabsList className="mx-6">
                        <TabsTrigger value="Login">Login</TabsTrigger>
                        <TabsTrigger value="Register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Login" className="flex flex-col gap-8">
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="default"
                                className="w-full"
                                onClick={handleLogin}
                            >
                                Login
                            </Button>
                        </CardFooter>
                    </TabsContent>
                    <TabsContent
                        value="Register"
                        className="flex flex-col gap-8"
                    >
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="api_key">API Key</Label>
                                <Input
                                    id="api_key"
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="api_secret">API Secret</Label>
                                <Input
                                    id="api_secret"
                                    onChange={(e) =>
                                        setApiSecret(e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="default"
                                className="w-full"
                                onClick={handleRegister}
                            >
                                Register
                            </Button>
                        </CardFooter>
                    </TabsContent>
                </Tabs>
            </Card>
        </main>
    );
}
