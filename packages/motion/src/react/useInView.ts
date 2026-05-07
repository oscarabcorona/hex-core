"use client";

import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number | number[];
	once?: boolean;
}

/**
 * Tiny IntersectionObserver wrapper. Returns `[ref, inView]`. When
 * `once: true` the observer disconnects after the first intersection,
 * which is what most "animate-in on scroll" UX wants.
 * @param options - Forwarded to `IntersectionObserver`. `once` is the
 *                  one extra knob: disconnect after the first hit.
 * @returns A `[ref, inView]` tuple: attach the ref to the element you
 *          want to observe; `inView` flips to `true` on intersection.
 */
export function useInView<T extends Element = HTMLElement>(
	options?: UseInViewOptions,
): [React.RefObject<T | null>, boolean] {
	const ref = useRef<T | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node || typeof IntersectionObserver === "undefined") return;
		// Guard against late callbacks: if an observer entry fires between
		// `observer.disconnect()` (cleanup) and React reconciling the
		// unmounted state, calling `setInView` would warn under strict
		// mode. The `mounted` flag flips false in cleanup so the entry
		// callback bails before touching state.
		let mounted = true;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!mounted) return;
				const entry = entries[0];
				if (!entry) return;
				setInView(entry.isIntersecting);
				if (entry.isIntersecting && options?.once) observer.disconnect();
			},
			{
				root: options?.root ?? null,
				rootMargin: options?.rootMargin ?? "0px",
				threshold: options?.threshold ?? 0,
			},
		);
		observer.observe(node);
		return () => {
			mounted = false;
			observer.disconnect();
		};
	}, [options?.root, options?.rootMargin, options?.threshold, options?.once]);

	return [ref, inView];
}
