import type { SVGProps } from 'react';

type IconName = 'arrow' | 'github' | 'x' | 'youtube' | 'sun' | 'moon' | 'glasses' | 'sparkle';

export default function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const paths: Record<Exclude<IconName, 'glasses'>, React.ReactNode> = {
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    github: <><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2.1 3.3-.4 6.8-1.6 6.8-7.2 0-1.6-.6-2.9-1.6-3.9.2-.4.7-1.9-.2-3.8 0 0-1.3-.4-4.1 1.5a14 14 0 0 0-7.4 0C5.2 1.2 4 1.6 4 1.6c-.9 1.9-.4 3.4-.2 3.8a5.8 5.8 0 0 0-1.6 3.9c0 5.6 3.4 6.8 6.7 7.2-.5.4-.9 1.2-.9 2.1V22" /></>,
    x: <><path d="m4 3 12 18h4L8 3H4Z" /><path d="m20 3-7 8M11 14l-7 7" /></>,
    youtube: <><rect x="2" y="5" width="20" height="14" rx="5" /><path d="m10 9 5 3-5 3V9Z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    moon: <path d="M20.8 13A9 9 0 0 1 11 3.2a9 9 0 1 0 9.8 9.8Z" />,
    sparkle: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />,
  };

  if (name === 'glasses') {
    return <svg viewBox="0 0 40 18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M0 2h40v4h-3v8h-3v3H23V6h-6v11H6v-3H3V6H0Z" />
      <path fill="var(--surface)" d="M6 5h3v3H6zm3 3h3v3H9zm3-3h3v3h-3zm12 0h3v3h-3zm3 3h3v3h-3zm3-3h3v3h-3z" />
    </svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
