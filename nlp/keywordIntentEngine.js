const tf = require("@tensorflow/tfjs");
// Register the CPU backend explicitly
tf.setBackend("cpu");

const use = require("@tensorflow-models/universal-sentence-encoder");

const Departments = require("../models/departmentscollection");
const KnowledgeBase = require("../models/knowledgeBase");

let model = null;
let modelLoadError = null;

/**
 * Load USE model once with error handling
 */
async function loadModel() {
    if (modelLoadError) {
        console.warn("Model previously failed to load. Using keyword-only matching.");
        return null;
    }
    if (!model) {
        try {
            model = await use.load();
        } catch (err) {
            modelLoadError = err;
            console.error("Failed to load Universal Sentence Encoder model:", err.message);
            console.warn("Falling back to keyword-only intent detection.");
            return null;
        }
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
 * Step 2: Score KnowledgeBase answers semantically with TensorFlow (or fallback to simple text matching)
 */
async function semanticMatchAnswer(text, intent) {
    const kbEntries = await KnowledgeBase.find({ intent }).lean();
    if (!kbEntries.length)
        return { answer: "I'm sorry, I don't have information on that yet.", confidence: 0 };

    const model = await loadModel();

    // Fallback: if model failed, use simple string matching
    if (!model) {
        const lowerText = text.toLowerCase();
        let bestMatch = kbEntries[0];
        let bestScore = 0;

        for (const entry of kbEntries) {
            const matchCount = (entry.question.toLowerCase().split(" ").filter(word => 
                lowerText.includes(word) && word.length > 3
            )).length;
            
            if (matchCount > bestScore) {
                bestScore = matchCount;
                bestMatch = entry;
            }
        }

        return {
            answer: bestMatch.answer,
            confidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0.5,
            kbId: bestMatch._id
        };
    }

    // TensorFlow semantic matching
    try {
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
    } catch (err) {
        console.error("Semantic matching failed:", err.message);
        // Fallback to first entry
        return {
            answer: kbEntries[0].answer,
            confidence: 0.5,
            kbId: kbEntries[0]._id
        };
    }
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