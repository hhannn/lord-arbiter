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
import { ThemeProvider } from "@/components/theme-provider";

export default function Home() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [apiKey, setApiKey] = React.useState("");
    const [apiSecret, setApiSecret] = React.useState("");
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleLogin = async () => {
        const res = await fetch(`/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const json = await res.json();
        if (json.user_id) {
            localStorage.setItem("bybit_api_key", json.api_key);
            localStorage.setItem("bybit_api_secret", json.api_secret);
            localStorage.setItem("user_id", json.user_id);

            localStorage.setItem("username", json.username); // 👈 add
            localStorage.setItem("uid", json.uid);

            useUserData.getState().setKeys(json.api_key, json.api_secret);
            useUserData.getState().fetchData();
            router.push("/dashboard");
        }
    };

    const handleRegister = async () => {
        const res = await fetch(`/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
                api_key: apiKey,
                api_secret: apiSecret,
            }),
        });

        const json = await res.json();
        if (json.user_id) {
            // auto-login after register
            localStorage.setItem("bybit_api_key", apiKey);
            localStorage.setItem("bybit_api_secret", apiSecret);
            localStorage.setItem("user_id", json.user_id);

            useUserData.getState().setKeys(apiKey, apiSecret);
            useUserData.getState().fetchData();
            router.push("/dashboard");
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
