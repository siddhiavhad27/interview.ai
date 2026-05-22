import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, toggleTask, gradeAnswer } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, difficulty, tone, companyType }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile, difficulty, tone, companyType })
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReport || null
    }

    const getReportById = async (interviewId) => {
        if (!interviewId || interviewId === "undefined") return null
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport || null
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        } finally {
            setLoading(false)
        }
    }

    const handleToggleTask = async (interviewId, taskName) => {
        try {
            const data = await toggleTask(interviewId, taskName)
            if (data && data.completedTasks) {
                setReport(prev => ({
                    ...prev,
                    completedTasks: data.completedTasks
                }))
                return data.completedTasks
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleGradeAnswer = async (question, userAnswer, modelAnswer) => {
        try {
            const data = await gradeAnswer(question, userAnswer, modelAnswer)
            return data.gradeResult
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, handleToggleTask, handleGradeAnswer }

}