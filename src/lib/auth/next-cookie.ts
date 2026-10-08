// Remembers which page someone wanted while they go and open their email.
// Only a convenience: if the link is opened on another device, they land on
// the dashboard instead.
export const NEXT_COOKIE = "signin_next";
export const NEXT_COOKIE_MAX_AGE = 60 * 60; // one hour, the same as the link
