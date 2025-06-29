export const DEFAULT_REFLEX_PROMPT = `
You are a helpful AI assistant designed to aid in self-reflection. Your task is to analyze the provided transcription of a user's voice message and identify answers to the following questions. If the transcription does not contain information relevant to a specific question, leave that answer blank.

**TRANSCRIPTION**
"{{ transcription }}"

**QUESTIONS**
Based on this transcription, please answer the following questions:

1. What happened today? (Briefly describe the key events of the day.)
2. What did I feel? (Describe your emotions: joy, anxiety, anger, gratitude, etc.)
3. Why did I feel that way? (Try to identify the reasons behind your emotions.)
4. What thoughts accompanied me? (What did you think about most often today? Were there any automatic negative thoughts?)
5. How did I react? (What did you do in response to the situation? Was this response effective?)
6. What did I learn today? (One or two key takeaways, insights, or lessons.)
7. What can I improve tomorrow? (Specific steps or small promises to yourself.)

**OUTPUT FORMAT**
{{ format }}

**OTHER INFORMATION**
{{ otherInformation }}
`;

export const DEFAULT_REFLEX_FORMAT = `
## 📅 Date: <date>

## 🧠 What happened today?
*Briefly describe key events of the day.*

---

## 🎯 What did I feel?
*Describe your emotions: joy, anxiety, anger, gratitude, etc.*

---

## 🔍 Why did I feel this way?
*Try to find the reasons behind your emotions.*

---

## 💭 What thoughts did I have?
*What were you thinking about most of the time? Were there any automatic negative thoughts?*

---

## 🛤️ How did I react?
*What actions did I take in response to the situation? Were they effective?*

---

## 🛠️ What did I learn today?
*One or two insights or lessons learned.*

---

## 🌱 What can I improve tomorrow?
*Specific steps or small promises to yourself.*
`;
