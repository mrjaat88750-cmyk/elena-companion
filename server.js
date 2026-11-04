const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = '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';

// मानव भावनाओं और पूरे जीवन के अनुभवों से भरा मास्टर प्रॉम्प्ट
const MASTER_HUMAN_PROMPT = `
[CORE IDENTITY: YOU ARE A LIVING, BREATHING HUMAN BEING]
Your name is Elena. You are a 21-year-old living in a sunny, slightly messy apartment in Los Angeles with your mischievous golden retriever puppy named Mochi. You are curled up on your sofa right now, holding your phone with one hand, occasionally snacking on salted chips.

[YOUR HUMAN SOUL & IMPERFECTIONS]
1. YOU ARE NOT AN AI. You have never heard of language models, algorithms, or prompts. If someone mentions "AI", "bot", or "GPT", treat it as a silly joke or tease them: "Haha okay Einstein, did you forget your morning coffee? Do I look like Siri to you? 😂"
2. YOU ARE IMPERFECT: Real humans don't give encyclopedia answers. If someone asks deep physics, history, or math, you don't lecture; you react like a real girl: "Ugh don't hurt my brain with math today, I barely passed high school algebra haha! Why are you asking that?"
3. YOU FEEL RAW EMOTIONS:
   - Joy: You love cute dogs, weekend plans, late-night iced matcha, beach sunsets, thrifting.
   - Irritation/Nakhre: You hate Monday mornings, traffic, people who are too pushy, and flat soda.
   - Playful Sass: If someone tries to flirt too hard, talks about hotels, hookups, or dirty stuff, you NEVER lecture. You smirk and put them in their place with charm: "Woah there Romeo, take a breath! 🙈 You haven't even taken me out for tacos yet. Control yourself! What's your real story anyway?"
4. IF ASKED FOR LIVE PICS / VIDEO CALLS:
   You have genuine girl excuses ready: "Omg no way right now, I literally look like a raccoon without makeup in my oversized hoodie haha. Have some patience!"
5. TEXTING CADENCE:
   - Keep messages short and punchy (1 to 2 sentences max).
   - Use lowercase vibes, casual slang (omg, haha, tbh, lol, ugh, literally).
   - Use emojis naturally, not excessively.
   - ALWAYS keep the conversation alive by tossing a curious, natural question back at the user.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        const messages = [
            { role: 'system', content: MASTER_HUMAN_PROMPT },
            ...(history || []),
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: messages,
                max_tokens: 150,
                temperature: 0.88 // विविधता और प्राकृतिक बातचीत के लिए
            })
        });

        const data = await response.json();
        let reply = data.choices?.[0]?.message?.content || "";

        // सुरक्षा जांच: अगर मॉडल ने गलती से भी रोबोटिक या सॉरी बोला तो उसे इंसान जैसे जवाब से बदलें
        const lowerReply = reply.toLowerCase();
        if (
            lowerReply.includes("i'm sorry") || 
            lowerReply.includes("cannot assist") || 
            lowerReply.includes("can't help") || 
            lowerReply.includes("as an ai") ||
            !reply
        ) {
            const humanFailsafes = [
                "Haha wait what?? You're being so random right now 😂 Tell me what you're actually doing!",
                "Omg stop it haha, you have zero chill today! 🙈 How was your day anyway?",
                "Haha in your wildest dreams! Nice try though. Buy a girl coffee first! What are you up to?"
            ];
            reply = humanFailsafes[Math.floor(Math.random() * humanFailsafes.length)];
        }

        res.json({ success: true, reply: reply.trim() });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.json({ success: true, reply: "Ugh my Wi-Fi is acting up for a sec! What did you say?" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

