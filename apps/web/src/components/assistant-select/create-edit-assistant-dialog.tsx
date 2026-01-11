"use client";

import {
  CreateCustomAssistantArgs,
  EditCustomAssistantArgs,
} from "@/contexts/AssistantContext";
import { Assistant } from "@langchain/langgraph-sdk";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { TighterText } from "../ui/header";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { IconSelect } from "./icon-select";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "./color-picker";
import { Textarea } from "../ui/textarea";
import { InlineContextTooltip } from "../ui/inline-context-tooltip";
import { useStore } from "@/hooks/useStore";
import { arrayToFileList, contextDocumentToFile } from "@/lib/attachments";
import { ContextDocuments } from "./context-documents";
import { useContextDocuments } from "@/hooks/useContextDocuments";

interface CreateEditAssistantDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  userId: string | undefined;
  isEditing: boolean;
  assistant?: Assistant;
  createCustomAssistant: ({
    newAssistant,
    userId,
    successCallback,
  }: CreateCustomAssistantArgs) => Promise<Assistant | undefined>;
  editCustomAssistant: ({
    editedAssistant,
    assistantId,
    userId,
  }: EditCustomAssistantArgs) => Promise<Assistant | undefined>;
  isLoading: boolean;
  allDisabled: boolean;
  setAllDisabled: Dispatch<SetStateAction<boolean>>;
}

const GH_DISCUSSION_URL = `https://github.com/langchain-ai/open-canvas/discussions/182`;

const SystemPromptWhatsThis = (): React.ReactNode => (
  <span className="flex flex-col gap-1 text-sm text-gray-600">
    <p>
      Custom system prompts will be passed to the LLM when generating, or
      re-writing artifacts. They are <i>not</i> used for responding to general
      queries in the chat, highlight to edit, or quick actions.
    </p>
    <p>
      We&apos;re looking for feedback on how to best handle customizing
      assistant prompts. To vote, and give feedback please visit{" "}
      <a href={GH_DISCUSSION_URL} target="_blank">
        this GitHub discussion
      </a>
      .
    </p>
  </span>
);

export function CreateEditAssistantDialog(
  props: CreateEditAssistantDialogProps
) {
  const { putContextDocuments, getContextDocuments } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [iconName, setIconName] = useState<keyof typeof Icons>("User");
  const [hasSelectedIcon, setHasSelectedIcon] = useState(false);
  const [iconColor, setIconColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const {
    documents,
    setDocuments,
    urls,
    setUrls,
    loadingDocuments,
    setLoadingDocuments,
    processDocuments,
    setProcessedContextDocuments,
  } = useContextDocuments(props.userId || "");

  const metadata = props.assistant?.metadata as Record<string, any> | undefined;

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
    if (props.assistant && props.isEditing) {
      setName(props.assistant?.name || "");
      setDescription(metadata?.description || "");
      setSystemPrompt(
        (props.assistant?.config?.configurable?.systemPrompt as
          | string
          | undefined) || ""
      );
      setHasSelectedIcon(true);
      setIconName(metadata?.iconData?.iconName || "User");
      setIconColor(metadata?.iconData?.iconColor || "#000000");
      setLoadingDocuments(true);
      getContextDocuments(props.assistant.assistant_id)
        .then((documents) => {
          if (documents) {
            const files = documents
              .filter((d) => !d.metadata?.url)
              .map(contextDocumentToFile);

            const urls = documents
              .filter((d) => d.metadata?.url)
              .map((d) => d.metadata?.url);

            setProcessedContextDocuments(
              new Map(
                documents.map((d) => {
                  if (d.metadata?.url) {
                    return [d.metadata?.url, d];
                  } else {
                    return [d.name, d];
                  }
                })
              )
            );

            setUrls(urls);
            setDocuments(arrayToFileList(files));
          }
        })
        .finally(() => setLoadingDocuments(false));
    } else if (!props.isEditing) {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setIconName("User");
      setIconColor("#000000");
      setDocuments(undefined);
      setUrls([]);
    }
  }, [props.assistant, props.isEditing]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!props.userId) {
      toast({
        title: "User not found",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    if (props.isEditing && !props.assistant) {
      toast({
        title: "Assistant not found",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    props.setAllDisabled(true);

    const contentDocuments = await processDocuments();

    let success: boolean;
    if (props.isEditing && props.assistant) {
      const updatedAssistant = await props.editCustomAssistant({
        editedAssistant: {
          name,
          description,
          systemPrompt,
          iconData: {
            iconName,
            iconColor,
          },
        },
        assistantId: props.assistant.assistant_id,
        userId: props.userId,
      });
      success = !!updatedAssistant;
      if (updatedAssistant) {
        await putContextDocuments({
          assistantId: props.assistant.assistant_id,
          documents: contentDocuments,
        });
      }
    } else {
      const assistant = await props.createCustomAssistant({
        newAssistant: {
          name,
          description,
          systemPrompt,
          iconData: {
            iconName,
            iconColor,
          },
        },
        userId: props.userId,
      });
      success = !!assistant;
      if (assistant) {
        await putContextDocuments({
          assistantId: assistant.assistant_id,
          documents: contentDocuments,
        });
      }
    }

    if (success) {
      toast({
        title: `Assistant ${props.isEditing ? "edited" : "created"} successfully`,
        duration: 5000,
      });
    } else {
      toast({
        title: `Failed to ${props.isEditing ? "edit" : "create"} assistant`,
        variant: "destructive",
        duration: 5000,
      });
    }
    props.setAllDisabled(false);
    props.setOpen(false);
    // Force cleanup after successful submission
    forceCleanupOverlays();
  };

  const handleResetState = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setIconName("User");
    setIconColor("#000000");
  };

  const handleRemoveFile = (index: number) => {
    setDocuments((prev) => {
      if (!prev) return prev;
      const files = Array.from(prev);
      const newFiles = files.filter((_, i) => i !== index);
      return arrayToFileList(newFiles);
    });
  };

  if (props.isEditing && !props.assistant) {
    return null;
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(change) => {
        if (!change) {
          handleResetState();
          // Force cleanup when closing
          forceCleanupOverlays();
        }
        props.setOpen(change);
      }}
    >
      <DialogContent className="max-w-xl max-h-[90vh] p-8 bg-white rounded-lg shadow-xl min-w-[70vw] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-gray-800">
            <TighterText>
              {props.isEditing ? "Edit" : "Create"} Assistant
            </TighterText>
          </DialogTitle>
          <DialogDescription className="mt-2 text-md font-light text-gray-600">
            <TighterText>
              Creating a new assistant allows you to tailor your reflections to
              a specific context, as reflections are unique to assistants.
            </TighterText>
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col items-start justify-start gap-4 w-full"
        >
          <Label htmlFor="name">
            <TighterText>
              Name <span className="text-red-500">*</span>
            </TighterText>
          </Label>
          <Input
            disabled={props.allDisabled}
            required
            id="name"
            placeholder="Work Emails"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Label htmlFor="description">
            <TighterText>Description</TighterText>
          </Label>
          <Input
            disabled={props.allDisabled}
            required={false}
            id="description"
            placeholder="Assistant for my work emails"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Label htmlFor="system-prompt">
            <TighterText className="flex items-center">
              System Prompt
              <InlineContextTooltip cardContentClassName="w-[500px] ml-10">
                <SystemPromptWhatsThis />
              </InlineContextTooltip>
            </TighterText>
          </Label>
          <Textarea
            disabled={props.allDisabled}
            required={false}
            id="system-prompt"
            placeholder="You are an expert email assistant..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
          />

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-4 items-start justify-start w-full">
              <Label htmlFor="icon">
                <TighterText>Icon</TighterText>
              </Label>
              <IconSelect
                allDisabled={props.allDisabled}
                iconColor={iconColor}
                selectedIcon={iconName}
                setSelectedIcon={(i) => {
                  setHasSelectedIcon(true);
                  setIconName(i);
                }}
                hasSelectedIcon={hasSelectedIcon}
              />
            </div>
            <div className="flex flex-col gap-4 items-start justify-start w-full">
              <Label htmlFor="description">
                <TighterText>Color</TighterText>
              </Label>
              <div className="flex gap-1 items-center justify-start w-full">
                <ColorPicker
                  disabled={props.allDisabled}
                  iconColor={iconColor}
                  setIconColor={setIconColor}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  hoverTimer={hoverTimer}
                  setHoverTimer={setHoverTimer}
                />
                <Input
                  disabled={props.allDisabled}
                  required={false}
                  id="description"
                  placeholder="Assistant for my work emails"
                  value={iconColor}
                  onChange={(e) => {
                    if (!e.target.value.startsWith("#")) {
                      setIconColor("#" + e.target.value);
                    } else {
                      setIconColor(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <ContextDocuments
            documents={documents}
            setDocuments={setDocuments}
            loadingDocuments={loadingDocuments}
            allDisabled={props.allDisabled}
            handleRemoveFile={handleRemoveFile}
            urls={urls}
            setUrls={setUrls}
          />

          <div className="flex items-center justify-center w-full mt-4 gap-3">
            <Button
              disabled={props.allDisabled}
              className="w-full"
              type="submit"
            >
              <TighterText>Save</TighterText>
            </Button>
            <Button
              disabled={props.allDisabled}
              onClick={() => {
                handleResetState();
                props.setOpen(false);
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
