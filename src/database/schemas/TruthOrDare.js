const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema({
  category: reqString, // e.g., "truth," "dare," "paranoia," "nhie," "wyr," "hye," "wwyd"
  questionId: reqString, // e.g., "T123," "D456," "P789," "NHIE101," "WYR202," "HYE303," "WWYD404
  question: reqString,
});

const Model = mongoose.model("truth-or-dare-questions", Schema);

module.exports = {
  model: Model,

  addQuestion: async (category, question) => {
    // Find the latest question in the specified category to determine the next question ID
    const latestQuestion = await Model.findOne({ category }).sort({ questionId: -1 });

    let questionId = "T1"; // Default question ID format for "truth" category
    if (category === "dare") {
      questionId = "D1"; // Default question ID format for "dare" category
    } else if (category === "paranoia") {
      questionId = "P1"; // Default question ID format for "paranoia" category
    } else if (category === "nhie") {
      questionId = "NHIE1"; // Default question ID format for "nhie" category
    } else if (category === "wyr") {
      questionId = "WYR1"; // Default question ID format for "wyr" category
    } else if (category === "hye") {
      questionId = "HYE1"; // Default question ID format for "hye" category
    } else if (category === "wwyd") {
      questionId = "WWYD1"; // Default question ID format for "wwyd" category
    }

    if (latestQuestion) {
      // If there is a latest question, increment the question ID
      const latestQuestionId = latestQuestion.questionId;
      const idParts = latestQuestionId.split(/(\d+)/);
      const currentNumber = parseInt(idParts[1]);
      questionId = idParts[0] + (currentNumber + 1);
    }

    const data = new Model({
      category,
      questionId,
      question,
    });

    await data.save();
    return "Question added successfully!";
  },

  getQuestions: async (limit = 10, category = "random") => {
    const aggregate = [
      {
        $sample: { size: limit },
      },
    ];

    if (category !== "random") {
      aggregate.unshift({
        $match: { category },
      });
    }

    const questions = await Model.aggregate(aggregate);
    return questions;
  },

  deleteQuestion: async (category, questionId) => {
    await Model.deleteOne({ category, questionId });
    return "Question deleted successfully!";
  },
};
