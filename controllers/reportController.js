
import Report from "../models/report.js";
import User from "../models/User.js"
import Reel from "../models/reel.js";


export const createReport = async (req, res) => {
  const { userId, videoId, reportType } = req.body;
  const reporter = await User.findById(userId);
  const reportedVideo = await Reel.findById(videoId);
  try {
    const newReport = new Report({
      user: reporter,
      reportedVideo: reportedVideo,
      reportType:reportType,
    });
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Delete report by ID
export const deleteReportById = async (reportId) => {
    try {
      const deletedReport = await Report.findByIdAndDelete(reportId);
      return deletedReport;
    } catch (error) {
      console.error('Error deleting report by ID:', error);
      throw error;
    }
  };

  // Get all reports

  export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
  // Get report by ID
  export const getReportById = async (reportId) => {
    try {
      const report = await Report.findById(reportId);
      return report;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw error;
    }
  };
  
  
  
  
 
  


