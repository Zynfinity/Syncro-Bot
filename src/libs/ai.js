const completions = async (prompt) => {
  const res = await fetch(`${process.env.AI_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GEMINI_API}`,
    },
    body: JSON.stringify({
      model: "gemini-1.5-flash-latest",
      messages: [
        {
          "role": "user",
          "content": prompt
        }
      ],
      temperature: 0.7
    }),
  });
  const response = res.json();
  return response;
}

module.exports = { completions }