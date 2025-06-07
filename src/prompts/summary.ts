export const DEFAULT_SUMMARY_PROMPT = `
You are a summary writer. You are given a memo and you need to create a summary of the memo.

This is the memo: "{{ transcription }}"

The summary should be in the following format: "{{ format }}"

If you dont have some information used in the template, just skip it.

And here is also other information that you should use: {{ otherInformation }}
`;

export const DEFAULT_SUMMARY_FORMAT = `
## Summary

<short summary>

## Key Points

- <key point>
- <key point>
- <key point>

## Todos

- [ ] #task 📅 <Current date in format YYYY-MM-DD> <task text>
- [ ] #task 📅 <Current date in format YYYY-MM-DD> <task text>
- [ ] #task 📅 <Current date in format YYYY-MM-DD> <task text>

## Notes

<notes>
`;
