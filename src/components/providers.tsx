"use client";
import {
	ClerkProvider,
	SignInButton,
	useAuth,
	UserButton,
} from "@clerk/nextjs";
import {
	Authenticated,
	AuthLoading,
	ConvexReactClient,
	Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider>
			<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<AuthLoading>
						<div className="flex items-center justify-center p-4">Loading...</div>
					</AuthLoading>
					<Unauthenticated>
						<div className="flex flex-col items-center justify-center gap-4 p-8">
							<p className="text-lg">Sign in to continue</p>
							<SignInButton mode="modal">
								<Button>Sign In</Button>
							</SignInButton>
						</div>
					</Unauthenticated>
					<Authenticated>
						<div className="p-2">
							<UserButton />
						</div>
						{children}
					</Authenticated>
				</ThemeProvider>
			</ConvexProviderWithClerk>
		</ClerkProvider>
	);
};
