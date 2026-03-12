"use client";

import React from "react";
import NextLink from "next/link";
import {
  useRouter,
  usePathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

const NAV_STATE_QUERY_KEY = "__navState";
const NAV_STATE_STORAGE_PREFIX = "__nurrus_nav_state__";

const buildUrlWithState = (to: string, state?: unknown) => {
  if (typeof window === "undefined" || state === undefined) {
    return to;
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  sessionStorage.setItem(`${NAV_STATE_STORAGE_PREFIX}${id}`, JSON.stringify(state));
  const url = new URL(to, window.location.origin);
  url.searchParams.set(NAV_STATE_QUERY_KEY, id);
  return `${url.pathname}${url.search}${url.hash}`;
};

const readStateFromSearch = (search: URLSearchParams) => {
  if (typeof window === "undefined") {
    return null;
  }
  const id = search.get(NAV_STATE_QUERY_KEY);
  if (!id) {
    return null;
  }
  const raw = sessionStorage.getItem(`${NAV_STATE_STORAGE_PREFIX}${id}`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function useNavigate() {
  const router = useRouter();
  return React.useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to < 0) {
          window.history.back();
        } else if (to > 0) {
          window.history.forward();
        }
        return;
      }

      const target = buildUrlWithState(to, options?.state);
      if (options?.replace) {
        router.replace(target);
      } else {
        router.push(target);
      }
    },
    [router],
  );
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | string) => void] {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const nextSearchParams = useNextSearchParams();
  const searchParams = React.useMemo(
    () => new URLSearchParams(nextSearchParams?.toString() || ""),
    [nextSearchParams],
  );

  const setSearchParams = React.useCallback(
    (next: URLSearchParams | string) => {
      const query = typeof next === "string" ? next : next.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  return [searchParams, setSearchParams];
}

export function useLocation() {
  const pathname = usePathname() || "/";
  const nextSearchParams = useNextSearchParams();
  const search = nextSearchParams?.toString() || "";
  const searchParams = React.useMemo(() => new URLSearchParams(search), [search]);
  const state = React.useMemo(() => readStateFromSearch(searchParams), [searchParams]);

  return {
    pathname,
    search: search ? `?${search}` : "",
    hash: "",
    state,
    key: "",
  };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  const pathname = usePathname() || "/";
  const nextParams = useNextParams();
  const fromNext: Record<string, string> = {};
  Object.entries(nextParams || {}).forEach(([key, value]) => {
    if (typeof value === "string") {
      fromNext[key] = value;
      return;
    }
    if (Array.isArray(value) && value.length > 0) {
      fromNext[key] = value[0];
    }
  });

  if (fromNext.id || fromNext.categorySlug) {
    return fromNext as T;
  }

  const fallback: Record<string, string> = {};
  const productMatch = pathname.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    fallback.id = productMatch[1];
  }
  const orderMatch = pathname.match(/^\/order\/([^/]+)$/);
  if (orderMatch) {
    fallback.id = orderMatch[1];
  }
  const catalogMatch = pathname.match(/^\/catalog\/([^/]+)$/);
  if (catalogMatch) {
    fallback.categorySlug = catalogMatch[1];
  }

  return fallback as T;
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  state?: unknown;
  replace?: boolean;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, state, replace, onClick, children, ...rest }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || state === undefined) {
        return;
      }
      e.preventDefault();
      const target = buildUrlWithState(to, state);
      if (replace) {
        router.replace(target);
      } else {
        router.push(target);
      }
    };

    return (
      <NextLink href={to} replace={replace} onClick={handleClick} ref={ref} {...rest}>
        {children}
      </NextLink>
    );
  },
);

Link.displayName = "Link";

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Route = ({ element }: { element: React.ReactElement }) => element;
