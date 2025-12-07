const { GoogleGenAI } = require("@google/genai");


const solveDoubt = async(req , res)=>{


    try{

        const {messages,title,description,testCases,startCode} = req.body;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
       
        async function main() {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
        config: {
        systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startCode}

What you need to do is to do is to take user to the problem solution step by step, by first giving some hints and testcases, then giving some useful approaches and issues and correction in their solution if they provide one, and then finally correct solution if asked.

Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, so stick to it only, do not entertain any other queries unrelated to current problem context.
`},
// thinkingConfig: {
//         thinkingBudget: -1, // Disable thinking with 0, enable with -1
//       },
    });
     
    res.status(201).json({
        message:response.text
    });
    // console.log(response.text);
    }

    main();
      
    }
    catch(err){
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = solveDoubt;
