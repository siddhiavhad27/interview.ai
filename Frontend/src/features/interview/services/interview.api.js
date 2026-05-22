import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile, difficulty, tone, companyType }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)
    if (difficulty) formData.append("difficulty", difficulty)
    if (tone) formData.append("tone", tone)
    if (companyType) formData.append("companyType", companyType)

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data

}

export const toggleTask = async (interviewId, taskName) => {
    const response = await api.post(`/api/interview/report/${interviewId}/toggle-task`, { taskName })
    return response.data
}

export const gradeAnswer = async (question, userAnswer, modelAnswer) => {
    const response = await api.post("/api/interview/grade-answer", { question, userAnswer, modelAnswer })
    return response.data
}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}

/**
 * @description Service to converse with Career Assistant AI chatbot.
 */
export const chatWithAssistant = async ({ messages }) => {
    const response = await api.post("/api/interview/assistant/chat", { messages })
    return response.data
}