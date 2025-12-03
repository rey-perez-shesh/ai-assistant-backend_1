const use = require("@tensorflow-models/universal-sentence-encoder");

const Departments = require("../models/departmentscollection");
const KnowledgeBase = require("../models/knowledgeBase");

let model = null;

/**
 * Load USE model once
 */
async function loadModel() {
    if (!model) {
        model = await use.load();
    }
    return model;
}

/**
 * Step 1: Predict intent using Department keywords
 */
async function detectIntentByKeywords(text) {
    const departments = await Departments.find().lean();
    const lower = text.toLowerCase();

    let bestMatch = null;

    for (const dept of departments) {
        for (const keyword of dept.keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                bestMatch = {
                    department: dept,
                    intent: dept.name.toLowerCase().replace(/\s+/g, "_")  // auto-intent
                };
                break;
            }
        }
        if (bestMatch) break;
    }

    return bestMatch;
}

/**
 * Step 2: Score KnowledgeBase answers semantically with TensorFlow
 */
async function semanticMatchAnswer(text, intent) {
    const kbEntries = await KnowledgeBase.find({ intent }).lean();
    if (!kbEntries.length)
        return { answer: "I'm sorry, I don't have information on that yet.", confidence: 0 };

    const model = await loadModel();

    // embed input
    const inputEmbedding = await model.embed([text]);

    // embed all candidate KB questions
    const kbQuestions = kbEntries.map(q => q.question);
    const kbEmbeddings = await model.embed(kbQuestions);

    // cosine similarity
    const normalize = (t) => {
        const norm = t.norm("euclidean", false);
        return t.div(norm.expandDims(1));
    };

    const inputNorm = normalize(inputEmbedding);
    const kbNorm = normalize(kbEmbeddings);

    const similarities = inputNorm.matMul(kbNorm.transpose()).arraySync()[0];

    // find best
    let bestIndex = 0;
    let bestScore = similarities[0];
    for (let i = 1; i < similarities.length; i++) {
        if (similarities[i] > bestScore) {
            bestScore = similarities[i];
            bestIndex = i;
        }
    }

    return {
        answer: kbEntries[bestIndex].answer,
        confidence: bestScore,
        kbId: kbEntries[bestIndex]._id
    };
}

/**
 * MAIN FUNCTION: Predict AI Response
 */
async function predictAIResponse(text) {
    // Step 1 — keyword-based intent detection
    const keywordIntent = await detectIntentByKeywords(text);

    if (!keywordIntent) {
        return {
            intent: "unknown",
            answer: "I could not understand your question. Please rephrase or contact the school office.",
            confidence: 0
        };
    }

    // Step 2 — semantic match inside KB for this intent
    const { answer, confidence, kbId } = await semanticMatchAnswer(text, keywordIntent.intent);

    return {
        intent: keywordIntent.intent,
        department: keywordIntent.department.name,
        answer,
        confidence,
        kbId
    };
}

module.exports = {
    predictAIResponse
};