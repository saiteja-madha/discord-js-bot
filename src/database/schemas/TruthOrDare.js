const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const Schema = new mongoose.Schema({
  category: reqString,
  questionId: reqString,
  question: reqString,
  rating: {
    type: String,
    required: true,
    enum: ['PG', 'PG-13', 'PG-16', 'R'],
  },
})

const Model = mongoose.model('tod', Schema)

module.exports = {
  model: Model,

  addQuestion: async (category, question, rating) => {
    const latestQuestion = await Model.findOne({ category }).sort({
      questionId: -1,
    })

    let questionId = 'T1'
    const prefixMap = {
      dare: 'D',
      paranoia: 'P',
      nhie: 'NHIE',
      wyr: 'WYR',
      hye: 'HYE',
      wwyd: 'WWYD',
    }

    if (prefixMap[category]) {
      questionId = `${prefixMap[category]}1`
    }

    if (latestQuestion) {
      const latestQuestionId = latestQuestion.questionId
      const idParts = latestQuestionId.split(/(\d+)/)
      const currentNumber = parseInt(idParts[1])
      questionId = idParts[0] + (currentNumber + 1)
    }

    const data = new Model({
      category,
      questionId,
      question,
      rating,
    })

    await data.save()
    return 'Question added successfully!'
  },

  getQuestions: async (
    limit = 10,
    category = 'random',
    age = 13,
    requestedRating = null
  ) => {
    // Get allowed ratings based on age
    const allowedRatings = getAllowedRatings(age)

    // If a specific rating is requested, check if it's allowed
    if (requestedRating && !allowedRatings.includes(requestedRating)) {
      return [] // Return empty if requested rating isn't allowed for user's age
    }

    const aggregate = [
      {
        $match: {
          // If specific rating requested, use it; otherwise use all allowed ratings
          rating: requestedRating ? requestedRating : { $in: allowedRatings },
        },
      },
    ]

    // Add category filter if not random
    if (category !== 'random') {
      aggregate[0].$match.category = category
    }

    // Add random sampling
    aggregate.push({
      $sample: { size: limit },
    })

    const questions = await Model.aggregate(aggregate)
    return questions
  },

  deleteQuestion: async questionId => {
    const normalizedId = questionId.toUpperCase()

    const question = await Model.findOne({
      questionId: { $regex: new RegExp(`^${normalizedId}$`, 'i') },
    })

    if (!question) {
      throw new Error(`Question with ID ${normalizedId} not found`)
    }

    await Model.deleteOne({ _id: question._id })
    return {
      category: question.category,
      questionId: question.questionId,
      question: question.question,
      rating: question.rating,
    }
  },

  getQuestionById: async questionId => {
    const question = await Model.findOne({ questionId })
    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`)
    }
    return question
  },
}

function getAllowedRatings(age) {
  if (age >= 18) return ['PG', 'PG-13', 'PG-16', 'R']
  if (age >= 16) return ['PG', 'PG-13', 'PG-16']
  if (age >= 13) return ['PG', 'PG-13']
  return ['PG']
}
