"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const Dialog = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
>((props, ref) => {
  // Override the onOpenChange to prevent aria-hidden issues
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
    
    // Nuclear option - remove aria-hidden from everything when dialog closes
    if (!open) {
      const forceRemoveAriaHidden = () => {
        const allElements = document.querySelectorAll('[aria-hidden="true"]');
        allElements.forEach(element => {
          console.log('[Dialog] Force removing aria-hidden from:', element.className || element.tagName);
          element.removeAttribute('aria-hidden');
          element.removeAttribute('data-aria-hidden');
          
          // Force pointer-events back to auto
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = 'auto';
          }
        });
      };
      
      // Run immediately and with delays
      forceRemoveAriaHidden();
      setTimeout(forceRemoveAriaHidden, 0);
      setTimeout(forceRemoveAriaHidden, 10);
      setTimeout(forceRemoveAriaHidden, 50);
      setTimeout(forceRemoveAriaHidden, 100);
      setTimeout(forceRemoveAriaHidden, 200);
      setTimeout(forceRemoveAriaHidden, 500);
      setTimeout(forceRemoveAriaHidden, 1000);
    }
  }, [props.onOpenChange]);

  return (
    <DialogPrimitive.Root
      {...props}
      onOpenChange={handleOpenChange}
    />
  );
});
Dialog.displayName = DialogPrimitive.Root.displayName;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  
  // Inject CSS to override aria-hidden pointer-events and add global click handler
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Override pointer-events for aria-hidden elements */
      [aria-hidden="true"] {
        pointer-events: none !important;
      }
      
      /* But allow pointer-events on dialog elements */
      [role="dialog"], [data-radix-dialog-content], [data-radix-dialog-overlay] {
        pointer-events: auto !important;
      }
      
      /* Force enable pointer-events on main app container */
      .flex.h-screen.w-full.overflow-hidden.bg-white,
      .flex.h-screen.w-full.overflow-hidden.bg-white * {
        pointer-events: auto !important;
      }
      
      /* Force enable pointer-events on radix popper content */
      [data-radix-popper-content-wrapper] {
        pointer-events: auto !important;
      }
      
      /* Nuclear option - force all elements to be clickable */
      body *, button, a, input, textarea, select {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    // Add global click handler to bypass aria-hidden blocking
    const globalClickHandler = (e: MouseEvent) => {
      // Check if we're in a potentially blocked state
      const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]');
      if (ariaHiddenElements.length > 0) {
        console.log('[DialogOverlay] Global click handler - removing aria-hidden from all elements');
        ariaHiddenElements.forEach(element => {
          element.removeAttribute('aria-hidden');
          element.removeAttribute('data-aria-hidden');
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = 'auto';
          }
        });
      }
    };
    
    document.addEventListener('click', globalClickHandler, { capture: true });
    document.addEventListener('mousedown', globalClickHandler, { capture: true });
    
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('click', globalClickHandler, { capture: true });
      document.removeEventListener('mousedown', globalClickHandler, { capture: true });
    };
  }, []);
  
  // Ultra-aggressive cleanup function
  React.useEffect(() => {
    const cleanupFunction = () => {
      // Remove all aria-hidden attributes immediately
      const removeAllAriaHidden = () => {
        const allAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
        allAriaHidden.forEach(element => {
          console.log('[DialogOverlay] Nuclear cleanup removing aria-hidden from:', element.className || element.tagName);
          element.removeAttribute('aria-hidden');
          element.removeAttribute('data-aria-hidden');
          
          // Also force pointer-events to auto
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = 'auto';
          }
        });
      };
      
      // Remove any overlay elements that might be blocking
      const removeBlockingElements = () => {
        const selectors = [
          '[data-radix-dialog-overlay][data-state="closed"]',
          '.fixed.inset-0.z-50[data-state="closed"]',
          '[data-radix-portal] > div[data-state="closed"]'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            console.log('[DialogOverlay] Removing blocking element:', element.className || element.tagName);
            if (element.parentNode) {
              try {
                element.parentNode.removeChild(element);
              } catch (e) {
                console.warn('[DialogOverlay] Could not remove element:', e);
              }
            }
          });
        });
      };
      
      // Run cleanup immediately
      removeAllAriaHidden();
      removeBlockingElements();
      
      // Run cleanup with delays to catch any async changes
      setTimeout(removeAllAriaHidden, 50);
      setTimeout(removeAllAriaHidden, 100);
      setTimeout(removeAllAriaHidden, 200);
      setTimeout(removeAllAriaHidden, 500);
      setTimeout(removeBlockingElements, 100);
      setTimeout(removeBlockingElements, 300);
      
      // Set up continuous monitoring
      const observer = new MutationObserver(() => {
        removeAllAriaHidden();
      });
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'data-aria-hidden'],
        subtree: true
      });
      
      // Set up aggressive interval cleanup
      const intervalId = setInterval(() => {
        removeAllAriaHidden();
      }, 50); // Check every 50ms
      
      // Clean up after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        clearInterval(intervalId);
      }, 5000);
    };
    
    // Run cleanup on mount
    cleanupFunction();
    
    return () => {
      // Final cleanup on unmount
      setTimeout(() => {
        const allAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
        allAriaHidden.forEach(element => {
          element.removeAttribute('aria-hidden');
          element.removeAttribute('data-aria-hidden');
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = 'auto';
          }
        });
      }, 100);
    };
  }, []);

  const handleRef = React.useCallback((node: HTMLDivElement | null) => {
    // Set our internal ref
    if (overlayRef.current !== node) {
      (overlayRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
    
    // Forward the ref
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <DialogPrimitive.Overlay
      ref={handleRef}
      className={cn(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseIcon?: boolean;
  }
>(({ className, children, hideCloseIcon = false, ...props }, ref) => (
  <DialogPortal container={document.body}>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {!hideCloseIcon && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <Cross2Icon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
