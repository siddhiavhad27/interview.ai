const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, gradeUserAnswer, chatWithAssistant } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    let resumeText = ""
    if (req.file && req.file.buffer) {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        resumeText = resumeContent.text
    }

    const { selfDescription, jobDescription, difficulty, tone, companyType } = req.body

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
        difficulty,
        tone,
        companyType
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        difficulty,
        tone,
        companyType,
        completedTasks: [],
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

/**
 * @description Controller to toggle a task in the preparation plan.
 */
async function toggleTaskController(req, res) {
    const { interviewId } = req.params
    const { taskName } = req.body

    if (!taskName) {
        return res.status(400).json({ message: "taskName is required" })
    }

    try {
        const report = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
        if (!report) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const index = report.completedTasks.indexOf(taskName)
        if (index > -1) {
            report.completedTasks.splice(index, 1)
        } else {
            report.completedTasks.push(taskName)
        }

        await report.save()

        res.status(200).json({
            message: "Task status toggled successfully.",
            completedTasks: report.completedTasks
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * @description Controller to grade a candidate's answer.
 */
async function gradeAnswerController(req, res) {
    const { question, userAnswer, modelAnswer } = req.body

    if (!question || !userAnswer || !modelAnswer) {
        return res.status(400).json({ message: "question, userAnswer, and modelAnswer are required" })
    }

    try {
        const gradeResult = await gradeUserAnswer({ question, userAnswer, modelAnswer })
        res.status(200).json({
            message: "Answer graded successfully.",
            gradeResult
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error during grading." })
    }
}

/**
 * @description Controller to handle career assistant chatbot messages.
 */
async function chatWithAssistantController(req, res) {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "messages array is required" })
    }

    try {
        const reply = await chatWithAssistant({ messages })
        res.status(200).json({
            message: "Response generated successfully.",
            reply
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error during assistant chat." })
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController,
    toggleTaskController,
    gradeAnswerController,
    chatWithAssistantController
}