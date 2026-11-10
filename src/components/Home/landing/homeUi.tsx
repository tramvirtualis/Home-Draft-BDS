import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Bộ icon nét mảnh của trang chủ, gọi bằng <Icon name="arrow" />
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></symbol>
      <symbol id="i-cube" viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.8.2 4.8 1.9 5.5 5.4"/></symbol>
      <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2.5L4.5 13.5H12l-1 8 8.5-11H12l1-8z"/></symbol>
      <symbol id="i-file" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></symbol>
      <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z"/><path d="M4 20.5A2.5 2.5 0 006.5 23H20v-5M8 7.5h8M8 11h5"/></symbol>
      <symbol id="i-chat" viewBox="0 0 24 24"><path d="M20 12a8 8 0 01-11.6 7.1L4 20l1-4.1A8 8 0 1120 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/></symbol>
      <symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 12.5h18"/></symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
    </svg>
  );
}

export function Icon({ name }: { name: string }) {
  return <svg className="ic"><use href={`#i-${name}`} /></svg>;
}

// Link nhập ở trang quản trị: "/..." đi trong app, còn lại (#mục, https://, tel:) dùng thẻ a
export function SmartLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return to.startsWith("/") ? (
    <Link className={className} to={to}>{children}</Link>
  ) : (
    <a className={className} href={to}>{children}</a>
  );
}

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;
