const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

// Helper to retry transient AI errors (503 Service Unavailable, 429 Too Many Requests, or rate limit issues)
async function callAiWithRetry(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isTransient = error.status === 503 || error.status === 429 || 
                                (error.message && (
                                    error.message.includes("503") || 
                                    error.message.includes("429") || 
                                    error.message.includes("high demand") || 
                                    error.message.includes("Quota exceeded") ||
                                    error.message.includes("RESOURCE_EXHAUSTED") ||
                                    error.message.includes("UNAVAILABLE")
                                ));
            if (isTransient && i < retries - 1) {
                console.warn(`AI call failed with transient error: ${error.message}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // exponential backoff
            } else {
                throw error;
            }
        }
    }
}

// Helper to attempt a call with a primary model, and fall back to a backup model if it fails
async function generateContentWithFallback(primaryModel, backupModel, options) {
    try {
        console.log(`Calling Gemini API with primary model: ${primaryModel}`);
        return await callAiWithRetry(() => ai.models.generateContent({
            model: primaryModel,
            ...options
        }));
    } catch (primaryError) {
        console.warn(`Primary model ${primaryModel} failed. Attempting backup model ${backupModel}... Error: ${primaryError.message}`);
        if (backupModel && backupModel !== primaryModel) {
            try {
                return await callAiWithRetry(() => ai.models.generateContent({
                    model: backupModel,
                    ...options
                }));
            } catch (backupError) {
                console.error(`Backup model ${backupModel} also failed. Error: ${backupError.message}`);
                throw backupError;
            }
        }
        throw primaryError;
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription, difficulty = "Mid", tone = "Standard", companyType = "FAANG" }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Target Parameters:
                        - Target Experience Level/Difficulty: ${difficulty}
                        - Interview Tone/Style: ${tone} (e.g. Stress, Friendly, Standard)
                        - Company Culture/Style: ${companyType} (e.g. FAANG, Startup, Enterprise)

                        Please tailor the interview questions, expected answers, skill gaps, and preparation plan based on the above parameters. For example, if Tone is "Stress", make questions highly analytical or challenging. If Difficulty is "Lead" or "Senior", focus heavily on architecture and design.
`

    const response = await generateContentWithFallback("gemini-3-flash-preview", "gemini-2.5-flash", {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await generateContentWithFallback("gemini-3-flash-preview", "gemini-2.5-flash", {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

const answerGradingSchema = z.object({
    score: z.number().describe("A score between 0 and 100 indicating the quality of the user's answer compared to the model answer"),
    feedback: z.string().describe("Detailed feedback on strengths and weaknesses in the candidate's answer"),
    suggestions: z.string().describe("Suggestions on what they could add or how they can rephrase to get a higher score")
})

async function gradeUserAnswer({ question, userAnswer, modelAnswer }) {
    const prompt = `You are an expert interviewer. Grade the candidate's answer for the following question.
                    
                    Question: ${question}
                    Expected Model Answer: ${modelAnswer}
                    Candidate's Answer: ${userAnswer}

                    Analyze the candidate's response. Be constructive, professional, and assign a fair score from 0 to 100 based on completeness, accuracy, and professional delivery.`

    const response = await generateContentWithFallback("gemini-2.5-flash", "gemini-3-flash-preview", {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(answerGradingSchema),
        }
    })

    return JSON.parse(response.text)
}

async function chatWithAssistant({ messages }) {
    const formattedMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }))

    const systemInstruction = `You are Career Assistant AI, a world-class tech recruiter, engineering manager, and elite career counselor.
Your goal is to help candidates succeed in their job search, resume crafting, and interview preparations.
You can:
- Answer career-related questions, suggest learning resources, and design skill roadmaps.
- Review resume experience sections or pitch descriptions.
- Conduct simulated mock interview practices (ask one technical/behavioral question at a time, wait for response, and grade them constructively).
Keep your tone professional, warm, highly encouraging, and structured. Use clean markdown lists and formatting for maximum readability.`

    const response = await generateContentWithFallback("gemini-2.5-flash", "gemini-3-flash-preview", {
        contents: formattedMessages,
        config: {
            systemInstruction: systemInstruction
        }
    })

    return response.text
}

module.exports = { generateInterviewReport, generateResumePdf, gradeUserAnswer, chatWithAssistant }