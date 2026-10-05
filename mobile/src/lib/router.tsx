import type { ComponentProps } from 'react';
export function navigate(href:string){window.history.pushState(null,'',href);window.dispatchEvent(new Event('vertice:navigate'));window.scrollTo({top:0,behavior:'instant'});}
export default function Link({href,onClick,...props}:ComponentProps<'a'>&{href:string}){return <a {...props} href={href} onClick={e=>{onClick?.(e);if(!e.defaultPrevented&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!props.target){e.preventDefault();navigate(href);}}}/>;}
