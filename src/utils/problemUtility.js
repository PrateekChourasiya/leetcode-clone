const axios = require("axios");

const getLanguageById = (lang) => {
  const languages = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  return languages[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": "1a491de574msh0b9060c6c44cebcp174be6jsn53fb60f4675d",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();
};

const waiting = async (timer) => {
    setTimeout(()=>{
        return 1;
    },timer);
}

const submitTokens = async (resultTokens) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultTokens.join(","), // to convert the array into comma separated string
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "1a491de574msh0b9060c6c44cebcp174be6jsn53fb60f4675d",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while(true){
    const result = await fetchData();

    const isResultObtained = result.submissions.every((r)=> r.status_id > 2);

    if(isResultObtained){
        return result.submissions;
    }

    await waiting(1000);
  }

};

module.exports = { getLanguageById, submitBatch, submitTokens };
