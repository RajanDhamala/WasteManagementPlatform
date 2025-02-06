import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv'

dotenv.config()

const AiApi=async(ip,infos)=>{
    const genAI = new GoogleGenerativeAI(process.env.Api_Key);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "Hello can u help me with with fetching the browser name version an dip of here" }],
            },
            {
              role: "model",
              parts: [{ text: "Great to meet you. What would you like to know?" }],
            },
          ],
        });
    
        const result = await chat.sendMessageStream(infos,'can u just give ip address browser details only in reponse');
    
        let finalResponse = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text(); 
          process.stdout.write(chunkText); 
          finalResponse += chunkText; 
        }
    
        return finalResponse; 
      } catch (error) {
        console.error("Error handling text:", error);
        throw error;
      }
}

const imgReader = async (prompt, path) => {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
    const fileToGenerativePart = (path, mimeType) => {
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(path)).toString('base64'),
          mimeType,
        },
      };
    };
    const imagePart = fileToGenerativePart(path, 'image/jpeg');
  
    try {
      const result = await model.generateContent([prompt, imagePart,'']);
      console.log(result.response.text());
      return result.response.text(); 
    } catch (error) {
      console.error('Error handling image:', error);
      throw new Error('Failed to process image with AI.');
    }
  };


  const AiFormReview = async () => {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const schema = {
      description: "List of fruits with their details",
      type: "array",
      items: {

      }
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
  
    try {
      const result = await model.generateContent("List popular fruits with their color, taste, and whether they are seasonal.");
      const textResponse = await result.response.text();
      const fruits = JSON.parse(textResponse);
  
      console.log("Fruits data:", fruits);
      return fruits;
    } catch (error) {
      console.error("Error generating fruit data:", error);
    }
  };

export {
    AiApi,
    imgReader
}