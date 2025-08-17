// login/page.tsx

"use client";

import * as React from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { useUserData } from "@/store/useUserData";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link";
import { Loader2Icon } from "lucide-react";

const loginSchema = z.object({
    username: z.string()
        .min(1, "Username cannot be empty")
        .refine(s => !s.includes(" "), "Username cannot contain spaces"),
    password: z.string()
        .min(1, "Password cannot be empty")
        .refine(s => !s.includes(" "), "Password cannot contain spaces"),
})

export default function Home() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const router = useRouter();
    const { consent, checked, acceptConsent } = useCookieConsent();

    const API_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`/api/user/data`, {
                    method: "GET",
                    credentials: "include", // so cookies are sent
                });

                if (res.ok) {
                    toast.success("Logging in...");
                    const json = await res.json();
                    // Optional: store data if you want
                    console.log(json)
                    useUserData.getState().fetchData();
                    router.replace("/dashboard"); // 👈 redirect
                }
            } catch (err) {
                console.log("No active session");
            }
        };

        checkSession();
    }, [router]);

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

        if (res.ok) {
            await useUserData.getState().fetchData(); // ✅ fetch info from /api/user/data
            router.push("/dashboard");
        } else {
            // handle login failure
        }
    };

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: ""
        },
    })

    async function handleLogin(values: z.infer<typeof loginSchema>) {
        const { username, password } = values;

        try {
            const res = await fetch(`/api/user/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            let json;
            try {
                json = await res.json();
                console.log(json)
            } catch {
                toast.error("Login failed", {
                    description: "Please check your username and password",
                });
            }

            if (res.ok) {
                await useUserData.getState().fetchData(); // ✅ fetch info from /api/user/data
                useUserData.getState().setUserId(json.user_id, json.username, json.uid);

                router.push("/dashboard");
            } else {
                // handle login failure
                toast.error("Login failed", {
                    description: "Please check your username and password",
                });
            }
        } catch (e) {
            toast.error("Login failed", {
                description: String(e)
            });
            console.log(e)
        }

        // console.log(username)
        // console.log(password)
    }

    return (
        <main className="flex flex-col items-stretch justify-center gap-8 p-4 max-w-sm mx-auto min-h-screen">
            <Card className="bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <h1 className="text-2xl xl:text-5xl font-semibold text-balance">
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
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-background/20" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} className="bg-background/20" />
                                                </FormControl>
                                                <FormMessage />
                                                <Link href="#" className="text-sm text-primary">Forgot your password?</Link>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        {...form.formState}
                                        disabled={form.formState.isSubmitting}
                                        size={form.formState.isSubmitting ? "sm" : "default"}
                                        className="w-full mt-8"
                                    >
                                        {
                                            form.formState.isSubmitting ?
                                                <>
                                                    <Loader2Icon className="animate-spin" />
                                                    Logging in...
                                                </> :
                                                "Login"
                                        }
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </TabsContent>
                    <TabsContent
                        value="Register"
                        className="flex flex-col gap-8"
                    >
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="username">Username</Label>
                                <Input className="bg-background/20"
                                    id="username"
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input className="bg-background/20"
                                    type="password"
                                    id="password"
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="api_key">API Key</Label>
                                <Input className="bg-background/20"
                                    id="api_key"
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-3">
                                <Label htmlFor="api_secret">API Secret</Label>
                                <Input className="bg-background/20"
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
