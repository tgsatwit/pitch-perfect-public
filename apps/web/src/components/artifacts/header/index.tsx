import { ReflectionsDialog } from "../../reflections-dialog/ReflectionsDialog";
import { ArtifactTitle } from "./artifact-title";
import { NavigateArtifactHistory } from "./navigate-artifact-history";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { Assistant } from "@langchain/langgraph-sdk";
import { PanelRightClose } from "lucide-react";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { CustomQuickActions } from "../actions_toolbar/custom";
import { GraphInput } from "@opencanvas/shared/types";
import { UserType } from "../actions_toolbar/custom";
import { Button } from "@/components/ui/button";

interface ArtifactHeaderProps {
  isBackwardsDisabled: boolean;
  isForwardDisabled: boolean;
  setSelectedArtifact: (index: number) => void;
  currentArtifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
  isArtifactSaved: boolean;
  totalArtifactVersions: number;
  selectedAssistant: Assistant | undefined;
  artifactUpdateFailed: boolean;
  chatCollapsed: boolean;
  setChatCollapsed: (c: boolean) => void;
  user: UserType | undefined;
  userLoading: boolean;
  streamMessage: (params: GraphInput) => Promise<void>;
  onSaveAndProceed?: () => void;
  createdPitchId?: string;
}

export function ArtifactHeader(props: ArtifactHeaderProps) {

  
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center justify-center gap-2">
        {props.chatCollapsed && (
          <TooltipIconButton
            tooltip="Expand Chat"
            variant="ghost"
            className="w-fit h-fit p-2 ml-2"
            delayDuration={400}
            onClick={() => props.setChatCollapsed(false)}
          >
            <PanelRightClose className="w-6 h-6 text-gray-600" />
          </TooltipIconButton>
        )}
        <ArtifactTitle
          title={props.currentArtifactContent.title}
          isArtifactSaved={props.isArtifactSaved}
          artifactUpdateFailed={props.artifactUpdateFailed}
        />
      </div>
      <div className="flex gap-2 items-end mt-[10px] mr-4">
        <NavigateArtifactHistory
          isBackwardsDisabled={props.isBackwardsDisabled}
          isForwardDisabled={props.isForwardDisabled}
          setSelectedArtifact={props.setSelectedArtifact}
          currentArtifactIndex={props.currentArtifactContent.index}
          totalArtifactVersions={props.totalArtifactVersions}
        />
        <ReflectionsDialog selectedAssistant={props.selectedAssistant} />
        <CustomQuickActions
          streamMessage={props.streamMessage}
          assistantId={props.selectedAssistant?.assistant_id}
          user={props.user}
          userLoading={props.userLoading}
          isTextSelected={false}
        />
        {props.createdPitchId && props.onSaveAndProceed && (
          <Button 
            onClick={props.onSaveAndProceed}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white mb-1 ml-2"
          >
            Save & Build Deck
          </Button>
        )}
      </div>
    </div>
  );
}
