/**
 * usePageTitle.js — L25 Fix
 * Sets the browser tab title for each page.
 * Auto-resets to the app name on unmount.
 */
import { useEffect } from 'react';

const APP_NAME = 'College Dress Marketplace';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}
