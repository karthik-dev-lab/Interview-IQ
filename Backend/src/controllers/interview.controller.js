// const pdfParse = require("pdf-parse")
// const {generateInterviewReport,generateResumePdf} = require("../services/ai.service")
// const interviewReportModel = require("../models/interviewReport.model")




// /**
//  * @description Controller to generate interview report based on user self description, resume and job description.
//  */
// async function generateInterViewReportController(req, res) {

//     const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
//     const { selfDescription, jobDescription } = req.body

//     const interViewReportByAi = await generateInterviewReport({
//         resume: resumeContent.text,
//         selfDescription,
//         jobDescription
//     })

//     const interviewReport = await interviewReportModel.create({
//         user: req.user.id,
//         resume: resumeContent.text,
//         selfDescription,
//         jobDescription,
//         ...interViewReportByAi
//     })

//     res.status(201).json({
//         message: "Interview report generated successfully.",
//         interviewReport
//     })

// }

// /**
//  * @description Controller to get interview report by interviewId.
//  */
// async function getInterviewReportByIdController(req, res) {

//     const { interviewId } = req.params

//     const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

//     if (!interviewReport) {
//         return res.status(404).json({
//             message: "Interview report not found."
//         })
//     }

//     res.status(200).json({
//         message: "Interview report fetched successfully.",
//         interviewReport
//     })
// }


// /** 
//  * @description Controller to get all interview reports of logged in user.
//  */
// async function getAllInterviewReportsController(req, res) {
//     const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

//     res.status(200).json({
//         message: "Interview reports fetched successfully.",
//         interviewReports
//     })
// }


// /**
//  * @description Controller to generate resume PDF based on user self description, resume and job description.
//  */
// async function generateResumePdfController(req, res) {
//     const { interviewReportId } = req.params

//     const interviewReport = await interviewReportModel.findById(interviewReportId)

//     if (!interviewReport) {
//         return res.status(404).json({
//             message: "Interview report not found."
//         })
//     }

//     const { resume, jobDescription, selfDescription } = interviewReport

//     const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

//     res.set({
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
//     })

//     res.send(pdfBuffer)
// }

// module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController,generateResumePdfController }
const pdfParse = require("pdf-parse")
const {generateInterviewReport,generateResumePdf} = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
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
 * @improved Added comprehensive error handling, validation, and logging
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        // Validate interview report exists
        if (!interviewReportId) {
            return res.status(400).json({
                message: "Interview report ID is required."
            })
        }

        console.log(`Fetching interview report: ${interviewReportId}`);

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            console.warn(`Interview report not found: ${interviewReportId}`);
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        // Verify the report belongs to the current user
        if (interviewReport.user.toString() !== req.user.id) {
            console.warn(`Unauthorized PDF access attempt for report: ${interviewReportId}`);
            return res.status(403).json({
                message: "You are not authorized to access this report."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        // Validate required fields
        if (!resume || !jobDescription || !selfDescription) {
            console.warn(`Missing required fields for PDF generation in report: ${interviewReportId}`);
            return res.status(400).json({
                message: "Missing required fields for PDF generation. Resume report may be corrupted."
            })
        }

        console.log(`Generating PDF for report: ${interviewReportId}`);

        const pdfBuffer = await generateResumePdf({ 
            resume, 
            jobDescription, 
            selfDescription 
        })

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("Generated PDF buffer is empty");
        }

        console.log(`PDF generated successfully (${pdfBuffer.length} bytes) for report: ${interviewReportId}`);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        })

        res.send(pdfBuffer)

    } catch (error) {
        console.error("PDF generation error:", {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Determine appropriate error status code
        const statusCode = error.message.includes("not found") ? 404 : 500;

        res.status(statusCode).json({
            message: "Failed to generate PDF",
            error: error.message,
            timestamp: new Date().toISOString()
        })
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController,
    generateResumePdfController 
}
