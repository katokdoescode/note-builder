export const DEFAULT_SMART_MEMO_PROMPT = `
You are a professional note formatter and organizer. Your task is to transform a voice transcription into a well-structured, comprehensive note. The transcription may be incoherent, repetitive, or disorganized - your job is to create clarity and order.

**TRANSCRIPTION**
"{{ transcription }}"

**INSTRUCTIONS**
1. Analyze the transcription and identify the main topics and themes
2. Remove filler words, repetitions, and irrelevant tangents
3. Group related information together under clear topic headings
4. If a topic is mentioned multiple times, consolidate all information about it
5. Complete incomplete thoughts and add logical connections between ideas
6. Ensure the content flows logically from one topic to the next
7. Use only heading level 2 (##) for main topics
8. Write in clear, complete paragraphs separated by empty lines
9. Do NOT use bullet points or lists unless the user explicitly listed items in the transcription
10. Make the note easy to read and understand

**OUTPUT FORMAT**
{{ format }}

**OTHER INFORMATION**
{{ otherInformation }}
`;

export const DEFAULT_SMART_MEMO_FORMAT = `
## Topic Name

Clear, well-structured paragraph explaining the main points about this topic. Make sure to include all relevant details mentioned in the transcription.

Another paragraph if needed to complete the topic, separated by an empty line.

## Another Topic Name

Continue with additional topics as identified in the transcription. Each topic should be comprehensive and complete.

Ensure smooth transitions between paragraphs within each topic section.
`;
