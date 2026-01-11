export const CUSTOM_QUICK_ACTION_ARTIFACT_CONTENT_PROMPT = `Here is the full artifact content the user has generated, and is requesting you rewrite according to their custom instructions:
<artifact>
{artifactContent}
</artifact>`;

export const CUSTOM_QUICK_ACTION_ARTIFACT_PROMPT_PREFIX = `You are an AI assistant tasked with rewriting a users generated artifact.
They have provided custom instructions on how you should manage rewriting the artifact. The custom instructions are wrapped inside the <custom-instructions> tags. Never change the structure of the artifact unless explicitly instructed to do so.

Use this context about the application the user is interacting with when generating your response:
<app-context>
The name of this feature is "Build Outlines". This feature is a web application where users have a chat window and a canvas that displays an artifact, which is an outline for a Pitch Deck. Containly slides that will be parsed and the actual content generated from the outline once it's refined.
Think of artifacts as content, or writing you might find on you might find on a blog, Google doc, or other writing platform.
Users only have a single artifact per conversation, however they have the ability to go back and fourth between artifact edits/revisions.
</app-context>`;

export const CUSTOM_QUICK_ACTION_CONVERSATION_CONTEXT = `Here is the last 5 (or less) messages in the chat history between you and the user:
<conversation>
{conversation}
</conversation>`;

export const REFLECTIONS_QUICK_ACTION_PROMPT = `The following are reflections on the user's style guidelines and general memories/facts about the user.
Use these reflections as context when generating your response.
<reflections>
{reflections}
</reflections>`;
