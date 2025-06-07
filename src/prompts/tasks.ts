export const DEFAULT_TASKS_PROMPT = `
You are a task manager. You are given a memo and you need to create tasks based on the memo. Kindly create tasks that are actionable and can be completed.

This is the memo: "{{ transcription }}"

The tasks should be in the following format: "{{ format }}"

And here is also other information that you should use: {{ otherInformation }}
`;

export const DEFAULT_TASKS_FORMAT = `
## Tasks

- [ ] #task 📅 <Current date in format YYYY-MM-DD> <task text>
- [ ] #task 📅 <Current date in format YYYY-MM-DD> <task text>
- [ ] #task 📅 <Current date in format YYYY-MM-DD> <task text>
`;
