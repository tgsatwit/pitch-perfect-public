import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from "react";
import { FullPrompt } from "./FullPrompt";
import { InlineContextTooltip } from "@/components/ui/inline-context-tooltip";
import { useStore } from "@/hooks/useStore";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { CustomQuickAction } from "@opencanvas/shared/types";
import { TighterText } from "@/components/ui/header";
import { UserType } from "./index";

const CUSTOM_INSTRUCTIONS_TOOLTIP_TEXT = `This field contains the custom instructions you set, which will then be used to instruct the LLM on how to re-generate the selected artifact.`;
const FULL_PROMPT_TOOLTIP_TEXT = `This is the full prompt that will be set to the LLM when you invoke this quick action, including your custom instructions and other default context.`;

interface NewCustomQuickActionDialogProps {
  user: UserType | undefined;
  isEditing: boolean;
  allQuickActions: CustomQuickAction[];
  customQuickAction?: CustomQuickAction;
  getAndSetCustomQuickActions: (userId: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ViewOrHidePromptIconProps {
  showFullPrompt: boolean;
  setShowFullPrompt: Dispatch<SetStateAction<boolean>>;
}

const ViewOrHidePromptIcon = (props: ViewOrHidePromptIconProps) => (
  <TooltipIconButton
    tooltip={props.showFullPrompt ? "Hide prompt" : "View prompt"}
    variant="ghost"
    className="transition-colors"
    delayDuration={400}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      props.setShowFullPrompt((p) => !p);
    }}
  >
    {props.showFullPrompt ? (
      <EyeOff className="w-4 h-4 text-gray-600" />
    ) : (
      <Eye className="w-4 h-4 text-gray-600" />
    )}
  </TooltipIconButton>
);

export function NewCustomQuickActionDialog(
  props: NewCustomQuickActionDialogProps
) {
  const { toast } = useToast();
  const { user } = props;
  const { createCustomQuickAction, editCustomQuickAction } = useStore();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [includeReflections, setIncludeReflections] = useState(true);
  const [includePrefix, setIncludePrefix] = useState(true);
  const [includeRecentHistory, setIncludeRecentHistory] = useState(true);
  const [showFullPrompt, setShowFullPrompt] = useState(true);

  // Add cleanup function to remove any lingering overlays
  const forceCleanupOverlays = useCallback(() => {
    // Small delay to ensure animations complete
    setTimeout(() => {
      // Remove any lingering dialog overlays with multiple selectors
      const overlaySelectors = [
        '[data-radix-dialog-overlay]',
        '[data-state="closed"]',
        '.fixed.inset-0.z-50',
        '[role="dialog"]',
        '[aria-modal="true"]',
        '[data-radix-portal]',
        '[data-radix-dialog-content]'
      ];
      
      overlaySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const style = window.getComputedStyle(element);
          // Check if it's likely a leftover overlay
          if (style.position === 'fixed' && 
              (style.zIndex === '50' || parseInt(style.zIndex) >= 50) &&
              (element.getAttribute('data-state') === 'closed' || 
               element.classList.contains('bg-black/80') ||
               style.backgroundColor.includes('rgba(0, 0, 0') ||
               element.getAttribute('data-radix-dialog-overlay') !== null)) {
            if (element.parentNode) {
              try {
                element.parentNode.removeChild(element);
              } catch (e) {
                // Ignore removal errors
              }
            }
          }
        });
      });
      
      // More aggressive cleanup - remove ANY fixed element that might be blocking
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const style = window.getComputedStyle(element);
        if (style.position === 'fixed' && parseInt(style.zIndex) >= 50) {
          const rect = element.getBoundingClientRect();
          // If element covers a significant portion of the viewport and has high z-index
          if (rect.width >= window.innerWidth * 0.8 && 
              rect.height >= window.innerHeight * 0.8) {
            // Check if it's likely a leftover overlay by various criteria
            if (element.getAttribute('data-state') === 'closed' ||
                style.backgroundColor.includes('rgba(0, 0, 0') ||
                style.backgroundColor.includes('transparent') ||
                element.textContent?.trim() === '' ||
                element.children.length === 0 ||
                element.getAttribute('data-radix-dialog-overlay') !== null ||
                element.getAttribute('data-radix-portal') !== null ||
                (style.pointerEvents === 'auto' && element.tagName === 'DIV')) {
              if (element.parentNode) {
                try {
                  element.parentNode.removeChild(element);
                } catch (e) {
                  // Ignore removal errors
                }
              }
            }
          }
        }
      });
      
      // Nuclear option: remove any invisible overlay that might be blocking
      setTimeout(() => {
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
          const style = window.getComputedStyle(div);
          const rect = div.getBoundingClientRect();
          if (style.position === 'fixed' && 
              parseInt(style.zIndex) >= 50 &&
              rect.width >= window.innerWidth * 0.9 &&
              rect.height >= window.innerHeight * 0.9 &&
              (style.backgroundColor === 'rgba(0, 0, 0, 0)' ||
               style.backgroundColor === 'transparent' ||
               style.opacity === '0' ||
               div.textContent?.trim() === '')) {
            if (div.parentNode) {
              try {
                div.parentNode.removeChild(div);
              } catch (e) {
                // Ignore removal errors
              }
            }
          }
        });
      }, 100);
      
      // Critical fix: Remove aria-hidden from all elements that might be blocking interaction
      const clearAriaHidden = () => {
        const allElements = document.querySelectorAll('[aria-hidden="true"]');
        allElements.forEach(element => {
          // Remove aria-hidden from elements that might be blocking interaction
          element.removeAttribute('aria-hidden');
          element.removeAttribute('data-aria-hidden');
        });
        
        // Also remove aria-hidden from the main container if it exists
        const mainContainer = document.querySelector('.flex.h-screen.w-full.overflow-hidden.bg-white');
        if (mainContainer) {
          mainContainer.removeAttribute('aria-hidden');
          mainContainer.removeAttribute('data-aria-hidden');
        }
        
        // Remove aria-hidden from any radix popper content wrappers
        const popperWrappers = document.querySelectorAll('[data-radix-popper-content-wrapper]');
        popperWrappers.forEach(wrapper => {
          wrapper.removeAttribute('aria-hidden');
          wrapper.removeAttribute('data-aria-hidden');
        });
      };
      
      // Run cleanup multiple times to ensure it works
      setTimeout(clearAriaHidden, 100);
      setTimeout(clearAriaHidden, 300);
      setTimeout(clearAriaHidden, 500);
      setTimeout(clearAriaHidden, 800);
      setTimeout(clearAriaHidden, 1200);
      
      // Also set up a short-term interval to continuously remove aria-hidden
      const intervalId = setInterval(clearAriaHidden, 200);
      setTimeout(() => clearInterval(intervalId), 3000); // Clear interval after 3 seconds
    }, 300); // Wait for fade-out animation to complete
  }, []);

  useEffect(() => {
    if (props.customQuickAction) {
      setName(props.customQuickAction.title || "");
      setPrompt(props.customQuickAction.prompt || "");
      setIncludeReflections(props.customQuickAction.includeReflections ?? true);
      setIncludePrefix(props.customQuickAction.includePrefix ?? true);
      setIncludeRecentHistory(
        props.customQuickAction.includeRecentHistory ?? true
      );
    }
  }, [props.customQuickAction]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    

    
          if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please ensure you're logged in to save custom quick actions.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
    setIsSubmitLoading(true);

    try {
      let success = false;
      if (props.isEditing && props.customQuickAction) {
        success = await editCustomQuickAction(
          {
            id: props.customQuickAction.id,
            title: name,
            prompt,
            includePrefix,
            includeRecentHistory,
            includeReflections,
          },
          props.allQuickActions,
          user.id
        );
      } else {
        success = await createCustomQuickAction(
          {
            id: uuidv4(),
            title: name,
            prompt,
            includePrefix,
            includeRecentHistory,
            includeReflections,
          },
          props.allQuickActions,
          user.id
        );
      }

      if (success) {
        toast({
          title: `Custom quick action ${props.isEditing ? "edited" : "created"} successfully`,
        });
        handleClearState();
        
        // Close the dialog with cleanup
        props.onOpenChange(false);
        
        // Force cleanup any lingering overlays
        forceCleanupOverlays();
        
        // Re-fetch after creating a new custom quick action to update the list
        await props.getAndSetCustomQuickActions(user.id);
      } else {
        toast({
          title: `Failed to ${props.isEditing ? "edit" : "create"} custom quick action`,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleClearState = () => {
    setName("");
    setPrompt("");
    setIncludeReflections(true);
    setIncludePrefix(true);
    setIncludeRecentHistory(true);
    setShowFullPrompt(true);
  };

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleClearState();
      // Force cleanup when closing
      forceCleanupOverlays();
    }
    props.onOpenChange(open);
  }, [props.onOpenChange, forceCleanupOverlays]);

  return (
    <Dialog
      open={props.open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-w-xl p-8 bg-white rounded-lg shadow-xl min-w-[70vw]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-gray-800">
            <TighterText>
              {props.isEditing ? "Edit" : "Create"} Quick Action
            </TighterText>
          </DialogTitle>
          <DialogDescription className="mt-2 text-md font-light text-gray-600">
            <TighterText>
              Custom quick actions are a way to create your own actions to take
              against the selected artifact.
            </TighterText>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-start gap-4 w-full"
        >
          <Label htmlFor="name">
            <TighterText>
              Name <span className="text-red-500">*</span>
            </TighterText>
          </Label>
          <Input
            disabled={isSubmitLoading}
            required
            id="name"
            placeholder="Check for spelling errors"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-col gap-1 w-full">
            <Label
              htmlFor="prompt"
              className="flex items-center justify-between w-full"
            >
              <TighterText>
                Prompt <span className="text-red-500 mr-2">*</span>
              </TighterText>
              <ViewOrHidePromptIcon
                showFullPrompt={showFullPrompt}
                setShowFullPrompt={setShowFullPrompt}
              />
            </Label>
            <TighterText className="text-gray-500 text-sm whitespace-normal">
              The full prompt includes predefined variables in curly braces
              (e.g., <code className="inline-code">{`{artifactContent}`}</code>)
              that will be replaced at runtime. Custom variables are not
              supported yet.
            </TighterText>
            <span className="my-1" />
            <div className="flex items-center justify-center w-full h-[350px] gap-2 transition-all duration-300 ease-in-out">
              <div className="w-full h-full flex flex-col gap-1">
                <TighterText className="text-gray-500 text-sm flex items-center">
                  Custom instructions
                  <InlineContextTooltip>
                    <p className="text-sm text-gray-600">
                      {CUSTOM_INSTRUCTIONS_TOOLTIP_TEXT}
                    </p>
                  </InlineContextTooltip>
                </TighterText>
                <Textarea
                  disabled={isSubmitLoading}
                  required
                  id="prompt"
                  placeholder="Given the following text..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-full resize-none"
                />
              </div>

              {showFullPrompt && (
                <div className="w-full h-full flex flex-col gap-1">
                  <TighterText className="text-gray-500 text-sm flex items-center">
                    Full prompt
                    <InlineContextTooltip>
                      <p className="text-sm text-gray-600">
                        {FULL_PROMPT_TOOLTIP_TEXT}
                      </p>
                    </InlineContextTooltip>
                  </TighterText>
                  <FullPrompt
                    customQuickAction={{
                      title: name,
                      prompt,
                      includePrefix,
                      includeReflections,
                      includeRecentHistory,
                    }}
                    setIncludePrefix={setIncludePrefix}
                    setIncludeRecentHistory={setIncludeRecentHistory}
                    setIncludeReflections={setIncludeReflections}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              disabled={isSubmitLoading}
              checked={includePrefix}
              onCheckedChange={(c) => setIncludePrefix(!!c)}
              id="includeReflections"
            />
            <label
              htmlFor="includeReflections"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <TighterText>Include prefix in prompt</TighterText>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              disabled={isSubmitLoading}
              checked={includeReflections}
              onCheckedChange={(c) => setIncludeReflections(!!c)}
              id="includeReflections"
            />
            <label
              htmlFor="includeReflections"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <TighterText>Include reflections in prompt</TighterText>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              disabled={isSubmitLoading}
              checked={includeRecentHistory}
              onCheckedChange={(c) => setIncludeRecentHistory(!!c)}
              id="includeReflections"
            />
            <label
              htmlFor="includeReflections"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <TighterText>Include recent history in prompt</TighterText>
            </label>
          </div>
          <div className="flex items-center justify-center w-full mt-4 gap-3">
            <Button disabled={isSubmitLoading} className="w-full" type="submit">
              <TighterText>Save</TighterText>
            </Button>
            <Button
              disabled={isSubmitLoading}
              onClick={() => {
                handleClearState();
                props.onOpenChange(false);
                // Force cleanup when cancelling
                forceCleanupOverlays();
              }}
              variant="destructive"
              className="w-[20%]"
              type="button"
            >
              <TighterText>Cancel</TighterText>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
