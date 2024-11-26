import { updateSession } from "@midday/supabase/middleware";
import { createClient } from "@midday/supabase/server";
import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";

// Internationalization middleware setup for English language
const I18nMiddleware = createI18nMiddleware({
  locales: ["en"], // Supported languages
  defaultLocale: "en", // Default language
  urlMappingStrategy: "rewrite", // URL handling strategy
});

export async function middleware(request: NextRequest) {
  // Initialize response with session update and i18n handling
  const response = await updateSession(request, I18nMiddleware(request));
  const supabase = createClient();
  const url = new URL("/", request.url);
  const nextUrl = request.nextUrl;

  // Extract locale from URL path
  const pathnameLocale = nextUrl.pathname.split("/", 2)?.[1];

  // Remove locale prefix from pathname for cleaner routing
  const pathnameWithoutLocale = pathnameLocale
    ? nextUrl.pathname.slice(pathnameLocale.length + 1)
    : nextUrl.pathname;

  // Create clean URL without locale
  const newUrl = new URL(pathnameWithoutLocale || "/", request.url);

  // Get user session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Authentication check
  // Redirect to login if user is not authenticated and trying to access protected routes
  if (
    !session &&
    newUrl.pathname !== "/login" &&
    !newUrl.pathname.includes("/report") &&
    !newUrl.pathname.includes("/i/")
  ) {
    const encodedSearchParams = `${newUrl.pathname.substring(1)}${
      newUrl.search
    }`;

    const url = new URL("/login", request.url);

    // Preserve return_to parameter for post-login redirect
    if (encodedSearchParams) {
      url.searchParams.append("return_to", encodedSearchParams);
    }

    return NextResponse.redirect(url);
  }

  // User setup check
  // Redirect to setup if authenticated user hasn't completed profile
  if (
    newUrl.pathname !== "/setup" &&
    newUrl.pathname !== "/teams/create" &&
    session &&
    !session?.user?.user_metadata?.full_name
  ) {
    // Special handling for team invites
    const inviteCodeMatch = newUrl.pathname.startsWith("/teams/invite/");

    if (inviteCodeMatch) {
      return NextResponse.redirect(`${url.origin}${newUrl.pathname}`);
    }

    return NextResponse.redirect(`${url.origin}/setup`);
  }

  // MFA (Multi-Factor Authentication) check
  const { data: mfaData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  // Redirect to MFA verification if required but not completed
  if (
    mfaData &&
    mfaData.nextLevel === "aal2" &&
    mfaData.nextLevel !== mfaData.currentLevel &&
    newUrl.pathname !== "/mfa/verify"
  ) {
    return NextResponse.redirect(`${url.origin}/mfa/verify`);
  }

  return response;
}

// Configure middleware to run on all routes except static assets and API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|monitoring).*)"],
};
