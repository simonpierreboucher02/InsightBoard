import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, Shield, Lock, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = insertUserSchema;
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const recoverySchema = z.object({
  username: z.string().min(1, "Username is required"),
  recoveryKey: z.string().min(1, "Recovery key is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState("");
  const [recoveryKeySaved, setRecoveryKeySaved] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const recoveryForm = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      username: "",
      recoveryKey: "",
      newPassword: "",
    },
  });

  // Redirect if already logged in - use useEffect to avoid setState during render
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Recovery key is now generated server-side

  const onLogin = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values, {
      onSuccess: () => setLocation("/"),
    });
  };

  const onRegister = (values: z.infer<typeof registerSchema>) => {
    // Submit registration directly and get server-generated recovery key
    registerMutation.mutate({ username: values.username, password: values.password }, {
      onSuccess: (response) => {
        setGeneratedRecoveryKey(response.recoveryKey);
        setShowRecoveryKey(true);
      },
    });
  };

  const completeRegistration = () => {
    if (!recoveryKeySaved) return;
    // Now set the user data to complete login and navigate to home
    if (registerMutation.data) {
      queryClient.setQueryData(["/api/user"], registerMutation.data.user);
      setLocation("/");
    }
  };

  const onRecovery = (values: z.infer<typeof recoverySchema>) => {
    // TODO: Implement password recovery with recovery key
    console.log("Recovery values:", values);
  };

  if (showRecoveryKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle>Your Recovery Key</CardTitle>
            <CardDescription>
              Save this key securely. You'll need it to recover your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
              <div className="font-mono text-center text-lg tracking-wider break-all" data-testid="text-recovery-key">
                {generatedRecoveryKey}
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This is your only chance to save this key. It cannot be recovered if lost.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="saved" 
                checked={recoveryKeySaved}
                onCheckedChange={(checked) => setRecoveryKeySaved(checked as boolean)}
                data-testid="checkbox-recovery-saved"
              />
              <Label htmlFor="saved" className="text-sm">
                I have saved my recovery key securely
              </Label>
            </div>
            <Button 
              className="w-full" 
              disabled={!recoveryKeySaved}
              onClick={completeRegistration}
              data-testid="button-complete-registration"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-app-title">InsightBoard</h1>
            <p className="text-muted-foreground" data-testid="text-app-subtitle">Privacy-first analytics platform</p>
          </div>

          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              <TabsTrigger value="recovery" data-testid="tab-recovery">Recovery</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-login-title">Sign In</CardTitle>
                  <CardDescription data-testid="text-login-description">
                    Enter your credentials to access your analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} data-testid="input-login-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} data-testid="input-login-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-register-title">Create Account</CardTitle>
                  <CardDescription data-testid="text-register-description">
                    Join InsightBoard with just a username and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} data-testid="input-register-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a strong password" {...field} data-testid="input-register-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} data-testid="input-register-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recovery">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-recovery-title">Account Recovery</CardTitle>
                  <CardDescription data-testid="text-recovery-description">
                    Use your recovery key to reset your password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...recoveryForm}>
                    <form onSubmit={recoveryForm.handleSubmit(onRecovery)} className="space-y-4">
                      <FormField
                        control={recoveryForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} data-testid="input-recovery-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={recoveryForm.control}
                        name="recoveryKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recovery Key</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="RT7K-M9PX-N4QZ-F8WY-J3VB-L6CS" 
                                className="font-mono" 
                                {...field} 
                                data-testid="input-recovery-key"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={recoveryForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a new password" {...field} data-testid="input-recovery-new-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" data-testid="button-recovery">
                        Reset Password
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-primary text-primary-foreground p-8 items-center justify-center">
        <div className="max-w-lg text-center">
          <Shield className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4" data-testid="text-hero-title">Privacy-First Analytics</h2>
          <p className="text-lg mb-6 opacity-90" data-testid="text-hero-description">
            Your data stays encrypted and private. No tracking, no data mining, just pure insights.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 mt-1 opacity-80" />
              <div>
                <h3 className="font-semibold">MinimalAuth Security</h3>
                <p className="text-sm opacity-80">Username + password + recovery key system</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 mt-1 opacity-80" />
              <div>
                <h3 className="font-semibold">Interactive Dashboards</h3>
                <p className="text-sm opacity-80">Drag-and-drop widgets with real-time charts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 mt-1 opacity-80" />
              <div>
                <h3 className="font-semibold">Data Sovereignty</h3>
                <p className="text-sm opacity-80">Your data never leaves your control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
